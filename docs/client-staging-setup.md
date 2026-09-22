# クライアント所有Supabaseでステージングを準備する

対象：クライアントの `DawgStrength_dev`。開発者所有のローカル検証DBとは別。

## MOV対応の追加設定（既存環境）

Storageの許可形式に `video/quicktime` を追加する。
SQL Editorでは [04-allow-course-staging-mov.sql](../supabase/sql-editor/04-allow-course-staging-mov.sql) を実行する。
初期インストールSQLの再実行は不要。既存ファイル、非公開設定、サイズ上限、他バケットは変更しない。
APIから設定する場合は `node scripts/enable-course-mov.mjs --project-ref <PROJECT_REF>` で確認し、
同じコマンドに `--apply` を付けて適用する。接続キーは既存の `.env.local` から読み込み、出力しない。
`public` スキーマの専用環境には `202609220001_allow_course_mov.sql` を適用する。
自動変換用サーバーや外部サービスは不要。MOVの再生互換性は保証されないため、必要に応じて
レッスン編集画面から変換済みMP4へ差し替える。
現在接続している `DawgStrength_dev` の `course-staging-media` にはAPIで適用済み。
適用後、既存の許可形式・非公開設定・5GBのバケット上限が維持されていることを確認済み。

## 確認できた状態（2026-09-19）

ユーザー提供の読み取り専用SQL結果では、`public` に12テーブルと5ビューがある。
Authユーザーは0人、Auth登録トリガー・Storageバケット・Storageポリシー・コース用関数は存在しない。
既存テーブルの利用有無や内容までは調査していない。既存のデータ・権限は保持する。
ビューに `rls_enabled=false` と出ることだけでは公開範囲は判定できない。

この構成に対し、`course_staging` スキーマにコース用10テーブルを追加し、非公開の
`course-staging-media` バケットを作る。認証ユーザーはSupabaseプロジェクト共通。
この文書のSQLは初回ステージング導入専用で、本番環境の導入・既存DBの更新用ではない。

## 1. 初回SQLを実行する

`DawgStrength_dev` のSQL Editor → New query、実行ロール `postgres` で
[01-install-course-staging.sql](../supabase/sql-editor/01-install-course-staging.sql) の全文を実行する。
まだこの環境で会員登録を行わないこと。旧 `202609080001_course_platform.sql` は使わない。
このクライアント環境に `supabase db push` でローカル用migrationを適用しない。

`begin;` から `commit;` まで一度に実行する。SQL自身がRLSを有効にするため、
SQL EditorにRLSの確認が出た場合は `Run without RLS` でSQLをそのまま実行する。
これはRLSを無効にする指定ではなく、エディタに追加のSQLを挿入させないため。

作成対象は専用スキーマ・テーブル・関数・ポリシー・バケットと、Auth登録時の
プロフィール作成トリガー。既存の `public` テーブルは変更しない。
既存Authアカウントの一括取り込みや管理者の自動作成は行わない。

初期監査後にAuthユーザー・トリガー・Storageポリシーが増えていた場合、または対象バケットが
既にある場合は処理を停止する。その際は削除して進めず、エラー内容を共有して導入方法を調整する。
途中の失敗はトランザクションで追加分を取り消す。成功後の再実行は不要。

## 2. 検証SQLを実行する

[02-verify-course-staging.sql](../supabase/sql-editor/02-verify-course-staging.sql) を実行する。
14行すべて `passed=true` であることを確認する。
これはDB設定の確認であり、実際のメール送信・動画アップロード・決済の確認は後で行う。

## 3. APIにスキーマを追加する

Supabaseのプロジェクト設定の Data API / API settings で、**Exposed schemas** に
`course_staging` を追加する。既存項目は削除しない。アプリが使用するスキーマの指定は次項で行う。
必要な権限は導入SQLに含まれているため、追加で全テーブルを `anon` に許可するSQLは実行しない。

参考：[Supabase公式・カスタムスキーマの公開](https://supabase.com/docs/guides/api/using-custom-schemas)。

公開設定後も `PGRST205`（テーブルがschema cacheに見つからない）が出る場合、SQL Editorで
`NOTIFY pgrst, 'reload schema';` を実行してから接続を再確認する。`reload config` だけでは
スキーマキャッシュの更新が完了しない場合がある。
参考：[PostgREST公式・Schema Cache](https://postgrest.org/en/stable/references/schema_cache.html)。

## 4. Vercelのステージング環境変数を設定する

対象のPreview環境（専用Vercel検証プロジェクトならそのデプロイ環境）に設定する。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=<DawgStrength_devのProject URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<同じプロジェクトの公開キー>
SUPABASE_SERVICE_ROLE_KEY=<同じプロジェクトのサーバー用キー>
NEXT_PUBLIC_COURSE_SCHEMA=course_staging
```

公開キーはpublishable keyまたは従来のanon key、サーバー用はsecret keyまたは従来のservice_role key。
秘密キーには `NEXT_PUBLIC_` を付けない。チャットやGitにキーを記載しない。
`NEXT_PUBLIC_COURSE_SCHEMA` はブラウザにもビルド時に反映されるため、変更後は再デプロイする。
スキーマ指定を省略した場合はローカル互換の `public` になるため、ステージングでは必ず設定する。
バケット名はスキーマと連動し、別の環境変数で設定する必要はない。

開発者所有DBを使う場合のスキーマは `public` または省略。現在はユーザーがローカルの
`.env.local` もクライアントの `course_staging` に変更し、その接続でデモ教材を投入済み。
Vercelの既存本番環境の接続先を、この作業で変更しない。

## 5. Auth設定、登録、管理者付与

ユーザーが必要な権限を取得し、Site URL・Redirect URLsの設定を完了したと報告済み。
実際の登録・確認メール・ログインの一連の動作は、別途確認する。

ステージングURLが決まったら、Supabase AuthのSite URLとRedirect URLsに反映する。
コールバックは `https://<ステージングのホスト>/auth/callback**` を許可する。
既存のURL設定があれば確認して保持する。一般ユーザーへのメール送信にはCustom SMTPも設定する。

アプリの `/register` から登録し、同じブラウザでメール確認する。
このプロジェクトに開発者DBのアカウント・管理者権限・教材は自動でコピーされない。

Authentication → Usersで自分のユーザーIDを確認し、
[03-promote-course-staging-admin.sql](../supabase/sql-editor/03-promote-course-staging-admin.sql) の
ゼロのUUIDを置き換えて実行する。確認済みアカウント1件だけが `admin` になる。
`/admin` でコース・動画を作成し、別の一般会員で閲覧権限とStripeテスト決済を確認する。

## 本番との境界・検証状況

### DashboardでAuthのURL設定を変更できない場合

ホスト版SupabaseのAuth URL設定は、SQLの `ALTER DATABASE` や `NOTIFY pgrst` では変更しない。
公式のManagement API `PATCH /v1/projects/{ref}/config/auth` を使う。
アプリの `service_role` キーはManagement API用の認証には使えない。
PATは発行したユーザーの権限を引き継ぐため、Dashboardで権限不足なら同じユーザーの
PATでも回避できない。権限を持つクライアント管理者による操作、または必要な権限の付与が必要。

管理者が利用できる環境で `SUPABASE_ACCESS_TOKEN` を設定し、以下を実行する。
トークンはチャットやコマンド引数へ貼らず、Git対象外のローカル環境変数で渡す。
この一時作業の管理用トークンをVercelのアプリ環境へ配置する必要はない。

```powershell
node scripts/configure-staging-auth.mjs
node scripts/configure-staging-auth.mjs --apply
```

1行目は現在の設定を読み取って追加分だけを表示する。2行目はクライアントの
`DawgStrength_dev` に、次の2つを既存設定を保持して追加し、APIから再取得して検証する。

```text
http://127.0.0.1:3000/auth/callback**
https://trainerwebsite-*-exodus-intelligence.vercel.app/auth/callback**
```

このスクリプトはSite URL・メール確認・SMTPを変更しない。今回のURL設定はユーザーが
権限取得後に実施済みであり、このManagement APIスクリプトは実環境では実行していない。

参考：[Management APIの認証](https://supabase.com/docs/reference/api/introduction)、
[Auth設定更新と必要な権限](https://supabase.com/docs/reference/api/v1-update-auth-service-config)。

### ステージングと本番の分離

この変更はステージング対応まで。本番を同じSupabase内で並行稼働させる場合は、別の
スキーマ・バケット・Stripe設定を用意し、教材・会員権限の移行手順を追加する。
Auth・メール設定・サービスキーは共通なので、プロジェクト単位の完全な環境分離にはならない。
SQLの名前だけ置換して本番へ適用しない。

ローカルPostgreSQL互換テストで、専用スキーマの導入、既存テーブルと権限の保持、
変更済み環境での導入停止、RLS、管理者付与、返金・購入権限を確認する。
クライアントの実SupabaseへのSQL適用はユーザーが実施し、検証SQLの14行すべてが
`passed=true` である結果を共有済み。DBの設定確認まで完了。
Data APIはスキーマキャッシュ再読み込み後に疎通を確認済み。ローカルアプリもステージング設定で起動済み。
サンプル教材のStorageへの投入と署名付き動画取得を確認済み。Vercel接続、実会員の
登録・メール・ログイン、管理画面からのアップロードは未確認。詳しくは `course-demo-data.md`。

2026-09-19の確認：`npm test` 42件成功、`npm run lint`、`npm run typecheck`、
`npm run build` 成功。ブラウザでのステージング検証は接続設定後に行う。

SQLの再生成は `node scripts/generate-course-staging-sql.mjs`。
ローカル用の基準SQLからステージング用3ファイルを生成する処理で、DBへ接続しない。
