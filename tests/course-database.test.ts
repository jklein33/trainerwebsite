import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

for (const schema of ["public", "course_staging"] as const) {
  test(`${schema}: paid content, administrator boundaries and payment ordering`, async (t) => {
    const engine = new PGlite();
    const scoped = (sql: string) =>
      sql
        .replaceAll("public.", `${schema}.`)
        .replaceAll(
          "'course-media'",
          schema === "public" ? "'course-media'" : "'course-staging-media'",
        );
    const db = {
      exec: (sql: string) => engine.exec(scoped(sql)),
      query: <T>(sql: string) => engine.query<T>(scoped(sql)),
      close: () => engine.close(),
    };
    await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}',email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;
    grant all on storage.objects to anon,authenticated,service_role;
  `);
    // gen_random_uuid is built into this PostgreSQL runtime; pgcrypto itself is a Supabase extension.
    const migration = (
      await readFile(
        new URL(
          schema === "public"
            ? "../supabase/migrations/202609080001_course_platform.sql"
            : "../supabase/sql-editor/01-install-course-staging.sql",
          import.meta.url,
        ),
        "utf8",
      )
    ).replace("create extension if not exists pgcrypto;", "");
    if (schema === "course_staging") {
      // Simulate an unrelated client table. Installing courses must preserve both
      // its contents and its permissions, including on failed installations.
      await engine.exec(
        "create table public.clients(id int primary key, note text); insert into public.clients values(1,'Preserve this'); alter table public.clients enable row level security;",
      );
      await t.test(
        "staging refuses changed Auth/Storage and rolls back",
        async () => {
          const cases = [
            [
              "insert into auth.users(id,email) values('90000000-0000-4000-8000-000000000001','existing@test.invalid')",
              "delete from auth.users",
            ],
            [
              "create policy old_broad_access on storage.objects for all to authenticated using(true)",
              "drop policy old_broad_access on storage.objects",
            ],
            [
              "insert into storage.buckets(id,public) values('course-staging-media',true)",
              "delete from storage.buckets",
            ],
            [
              "create function public.old_signup() returns trigger language plpgsql as $$ begin return new; end $$; create trigger old_signup after insert on auth.users for each row execute function public.old_signup()",
              "drop trigger old_signup on auth.users; drop function public.old_signup()",
            ],
          ];
          for (const [setup, cleanup] of cases) {
            await engine.exec(setup);
            await assert.rejects(
              engine.exec(migration),
              /differs from the empty audited state/,
            );
            await engine.exec("rollback");
            assert.equal(
              (
                await engine.query(
                  "select 1 from pg_namespace where nspname='course_staging'",
                )
              ).rows.length,
              0,
            );
            await engine.exec(cleanup);
          }
        },
      );
    }
    await db.exec(migration);
    if (schema === "course_staging") {
      await t.test(
        "staging preserves legacy tables without granting access",
        async () => {
          assert.deepEqual(
            (await engine.query("select * from public.clients")).rows,
            [{ id: 1, note: "Preserve this" }],
          );
          const result = await engine.query<{
            can_read: boolean;
            can_create: boolean;
          }>(
            "select has_table_privilege('authenticated','public.clients','select') as can_read, has_schema_privilege('authenticated','course_staging','create') as can_create",
          );
          assert.deepEqual(result.rows, [
            { can_read: false, can_create: false },
          ]);
          assert.equal(
            (
              await engine.query(
                "select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='courses'",
              )
            ).rows.length,
            0,
          );
        },
      );
    }
    const verifySql = await readFile(
      new URL(
        schema === "public"
          ? "../supabase/sql-editor/02-verify-course-platform.sql"
          : "../supabase/sql-editor/02-verify-course-staging.sql",
        import.meta.url,
      ),
      "utf8",
    );
    const adminSql = await readFile(
      new URL(
        schema === "public"
          ? "../supabase/sql-editor/03-promote-course-admin.sql"
          : "../supabase/sql-editor/03-promote-course-staging-admin.sql",
        import.meta.url,
      ),
      "utf8",
    );
    const admin = "00000000-0000-4000-8000-000000000001",
      buyer = "00000000-0000-4000-8000-000000000002",
      other = "00000000-0000-4000-8000-000000000003";
    const course = "10000000-0000-4000-8000-000000000001",
      second = "10000000-0000-4000-8000-000000000002",
      moduleId = "20000000-0000-4000-8000-000000000001",
      lesson = "30000000-0000-4000-8000-000000000001",
      draft = "30000000-0000-4000-8000-000000000002",
      video = "40000000-0000-4000-8000-000000000001",
      pdf = "40000000-0000-4000-8000-000000000002",
      secret = "40000000-0000-4000-8000-000000000003",
      order = "50000000-0000-4000-8000-000000000001";
    await db.exec(`insert into auth.users(id,email,raw_user_meta_data) values('${admin}','admin@test.invalid','{}'),('${buyer}','buyer@test.invalid','{"role":"admin"}'),('${other}','other@test.invalid','{}');update public.course_profiles set role='admin' where id='${admin}';
    insert into public.courses(id,title,status) values('${course}','Published','published'),('${second}','Private draft','draft');
    insert into public.course_modules(id,course_id,title,status) values('${moduleId}','${course}','Module','published');
    insert into public.course_assets(id,course_id,name,path,kind,mime_type,size_bytes,status) values
      ('${video}','${course}','Video','video.mp4','video','video/mp4',1000,'ready'),
      ('${pdf}','${course}','PDF','resource.pdf','attachment','application/pdf',1000,'ready'),
      ('${secret}','${course}','Private video','secret.mp4','video','video/mp4',1000,'ready');
    insert into public.course_lessons(id,module_id,title,status,video_asset_id) values('${lesson}','${moduleId}','Published lesson','published','${video}'),('${draft}','${moduleId}','Draft lesson','draft','${secret}');
    insert into public.course_attachments(lesson_id,asset_id) values('${lesson}','${pdf}');
    insert into public.course_orders(id,user_id,course_id,stripe_price_id) values('${order}','${buyer}','${course}','price_test');
    insert into storage.objects(bucket_id,name) values('course-media','video.mp4');`);
    async function as(role: string, user: string, sql: string) {
      await db.exec(
        `set role ${role};select set_config('request.jwt.claim.sub','${user}',false);`,
      );
      try {
        return await db.query(sql);
      } finally {
        await db.exec("reset role");
      }
    }
    async function count(table: string, user = buyer) {
      const result = await as(
        "authenticated",
        user,
        `select count(*)::int as n from public.${table}`,
      );
      return (result.rows[0] as { n: number }).n;
    }
    try {
      await t.test(
        "administrators can upload only to the configured course bucket",
        async () => {
          await as(
            "authenticated",
            admin,
            "insert into storage.objects(bucket_id,name) values('course-media','upload-test.mp4')",
          );
          await assert.rejects(
            as(
              "authenticated",
              admin,
              "insert into storage.objects(bucket_id,name) values('unrelated-bucket','upload-test.mp4')",
            ),
          );
          await as(
            "authenticated",
            admin,
            "delete from storage.objects where name='upload-test.mp4'",
          );
        },
      );
      await t.test(
        "SQL Editor installation checks pass and detect disabled RLS",
        async () => {
          const result = await db.query<{
            check_name: string;
            passed: boolean;
          }>(verifySql);
          assert.equal(result.rows.length, 14);
          assert.ok(result.rows.every((row) => row.passed));
          await db.exec(
            "alter table public.course_lessons disable row level security",
          );
          const changed = await db.query<{
            check_name: string;
            passed: boolean;
          }>(verifySql);
          assert.equal(
            changed.rows.find((row) =>
              row.check_name.endsWith(`${schema}.course_lessons`),
            )?.passed,
            false,
          );
          await db.exec(
            "alter table public.course_lessons enable row level security",
          );
        },
      );
      await t.test(
        "SQL Editor promotion requires a real, confirmed account",
        async () => {
          assert.equal((await db.query(adminSql)).rows.length, 0);
          const promoteOther = adminSql.replaceAll(
            "00000000-0000-0000-0000-000000000000",
            other,
          );
          assert.equal((await db.query(promoteOther)).rows.length, 0);
          await db.exec(
            `update auth.users set email_confirmed_at=now() where id='${other}'`,
          );
          const promoted = await db.query<{ id: string; role: string }>(
            promoteOther,
          );
          assert.equal(promoted.rows.length, 1);
          assert.equal(promoted.rows[0].id, other);
          assert.equal(promoted.rows[0].role, "admin");
          await db.exec(
            `update public.course_profiles set role='learner' where id='${other}'`,
          );
        },
      );
      await t.test(
        "signup metadata cannot assign administrator privileges",
        async () => {
          const result = await as(
            "authenticated",
            buyer,
            `select role from public.course_profiles where id='${buyer}'`,
          );
          assert.equal((result.rows[0] as { role: string }).role, "learner");
          await assert.rejects(
            as(
              "authenticated",
              buyer,
              `update public.course_profiles set role='admin' where id='${buyer}'`,
            ),
          );
        },
      );
      await t.test(
        "anonymous users cannot read catalog or protected content",
        async () => {
          await assert.rejects(as("anon", "", "select * from public.courses"));
          await assert.rejects(
            as("anon", "", "select * from public.course_assets"),
          );
        },
      );
      await t.test(
        "unpaid accounts see only the catalog, not lessons or resources",
        async () => {
          assert.equal(await count("courses"), 1);
          assert.equal(await count("course_lessons"), 0);
          assert.equal(await count("course_assets"), 0);
          assert.equal(await count("course_attachments"), 0);
          await assert.rejects(
            as(
              "authenticated",
              buyer,
              `insert into public.courses(title) values('Injected')`,
            ),
          );
          await assert.rejects(
            as(
              "authenticated",
              buyer,
              `select public.course_manage_access('${buyer}','${course}',true,'self grant')`,
            ),
          );
        },
      );
      await t.test(
        "only service role can fulfill an order, and duplicate fulfillment is harmless",
        async () => {
          await assert.rejects(
            as(
              "authenticated",
              buyer,
              `select public.course_apply_payment('${order}','paid','cs_test','pi_test')`,
            ),
          );
          for (let i = 0; i < 2; i++)
            await as(
              "service_role",
              "",
              `select public.course_apply_payment('${order}','paid','cs_test','pi_test')`,
            );
          assert.equal(await count("course_entitlements"), 1);
        },
      );
      await t.test(
        "paid access exposes only published linked assets; storage itself stays private",
        async () => {
          assert.equal(await count("course_lessons"), 1);
          assert.equal(await count("course_assets"), 2);
          assert.equal(await count("course_attachments"), 1);
          assert.equal(await count("course_lessons", other), 0);
          const result = await as(
            "authenticated",
            buyer,
            "select * from storage.objects",
          );
          assert.equal(result.rows.length, 0);
        },
      );
      await t.test(
        "admin can read drafts and cannot link another course’s video",
        async () => {
          assert.equal(await count("courses", admin), 2);
          assert.equal(await count("course_lessons", admin), 2);
          await db.exec(
            `insert into public.course_modules(id,course_id,title) values('20000000-0000-4000-8000-000000000002','${second}','Other module')`,
          );
          await assert.rejects(
            as(
              "authenticated",
              admin,
              `insert into public.course_lessons(module_id,title,video_asset_id) values('20000000-0000-4000-8000-000000000002','Wrong reference','${video}')`,
            ),
          );
        },
      );
      await t.test(
        "referenced files cannot be archived and unlinked files remain archivable",
        async () => {
          for (const asset of [video, pdf, secret]) {
            await assert.rejects(
              as(
                "authenticated",
                admin,
                `update public.course_assets set status='archived' where id='${asset}'`,
              ),
            );
          }
          await db.exec(`insert into public.course_assets(course_id,name,path,kind,mime_type,size_bytes,status)
        values('${course}','Unused','unused.mp4','video','video/mp4',100,'ready')`);
          await as(
            "authenticated",
            admin,
            "update public.course_assets set status='archived' where path='unused.mp4'",
          );
          assert.equal(await count("course_assets"), 2);
        },
      );
      await t.test(
        "expired grants and another member's purchases do not expose content",
        async () => {
          await db.exec(`insert into public.course_entitlements(user_id,course_id,source,source_id,expires_at)
        values('${other}','${course}','migration','expired-test',now()-interval '1 day')`);
          assert.equal(await count("course_lessons", other), 0);
          assert.equal(await count("course_orders", other), 0);
        },
      );
      await t.test(
        "disputes stay closed across late failure and success notifications",
        async () => {
          const disputedOrder = "50000000-0000-4000-8000-000000000002";
          await db.exec(`insert into public.course_orders(id,user_id,course_id,stripe_price_id)
        values('${disputedOrder}','${other}','${course}','price_test')`);
          for (const state of ["paid", "disputed", "failed", "paid"]) {
            await as(
              "service_role",
              "",
              `select public.course_apply_payment('${disputedOrder}','${state}','cs_disputed','pi_disputed')`,
            );
          }
          assert.equal(await count("course_lessons", other), 0);
          const result = await db.query(
            `select status from public.course_orders where id='${disputedOrder}'`,
          );
          assert.equal(
            (result.rows[0] as { status: string }).status,
            "disputed",
          );
        },
      );
      await t.test(
        "reordering rejects duplicates and crossing parents",
        async () => {
          await assert.rejects(
            as(
              "authenticated",
              admin,
              `select public.course_reorder('lesson',array['${lesson}','${lesson}']::uuid[])`,
            ),
          );
          await assert.rejects(
            as(
              "authenticated",
              admin,
              `select public.course_reorder('module',array['${moduleId}','20000000-0000-4000-8000-000000000002']::uuid[])`,
            ),
          );
          await as(
            "authenticated",
            admin,
            `select public.course_reorder('lesson',array['${draft}','${lesson}']::uuid[])`,
          );
          const result = await db.query(
            `select id from public.course_lessons where module_id='${moduleId}' order by position`,
          );
          assert.equal((result.rows[0] as { id: string }).id, draft);
        },
      );
      await t.test(
        "refund revokes only its own grant and late success cannot restore it",
        async () => {
          await as(
            "authenticated",
            admin,
            `select public.course_manage_access('${buyer}','${course}',true,'Existing member')`,
          );
          await as(
            "service_role",
            "",
            `select public.course_apply_payment('${order}','refunded',null,'pi_test')`,
          );
          await as(
            "service_role",
            "",
            `select public.course_apply_payment('${order}','paid','cs_test','pi_test')`,
          );
          assert.equal(await count("course_lessons"), 1);
          await as(
            "authenticated",
            admin,
            `select public.course_manage_access('${buyer}','${course}',false,'Manual access removed')`,
          );
          assert.equal(await count("course_lessons"), 0);
          const result = await db.query(
            `select status from public.course_orders where id='${order}'`,
          );
          assert.equal(
            (result.rows[0] as { status: string }).status,
            "refunded",
          );
        },
      );
      await t.test(
        "suspension and course archiving both close existing access",
        async () => {
          await as(
            "authenticated",
            admin,
            `select public.course_manage_access('${buyer}','${course}',true,'Restore manual access')`,
          );
          await as(
            "authenticated",
            admin,
            `select public.course_suspend_member('${buyer}',true)`,
          );
          assert.equal(await count("course_lessons"), 0);
          assert.equal(await count("course_assets"), 0);
          await as(
            "authenticated",
            admin,
            `select public.course_suspend_member('${buyer}',false)`,
          );
          assert.equal(await count("course_lessons"), 1);
          await as(
            "authenticated",
            admin,
            `update public.courses set status='archived' where id='${course}'`,
          );
          assert.equal(await count("course_lessons"), 0);
          assert.equal(await count("course_assets"), 0);
        },
      );
    } finally {
      await db.close();
    }
  });
}
