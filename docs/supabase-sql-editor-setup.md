# 新規SupabaseをSQL Editorでセットアップする

クライアントの `DawgStrength_dev` は [専用のステージング手順](client-staging-setup.md) を使う。このページはローカル用の専用プロジェクトに限る。

対象は今回新しく作るコース用の検証プロジェクト。既存の `DawgStrength_dev` には実行しない。
ローカルでSQLファイルを準備・検証済みだが、Supabase上への実行はまだ行っていない。

## 1. プロジェクトを作成する

Supabase Dashboardで新しいプロジェクトを作る。名前の例は `DawgStrength_Courses_dev`。
プロジェクトが起動したら、画面上部で新しいプロジェクトが選ばれていることを確認する。
データベースのパスワードは安全な場所に保存する。アプリ用APIキーとは別の値。

## 2. 最初のSQLを実行する

SQL Editor → New query を開き、以下のファイルの内容を全てコピーして貼り付ける。

[DB一括作成SQL](../supabase/migrations/202609080001_course_platform.sql)

先頭の `begin;` から末尾の `commit;` までを含め、選択範囲だけではなく全文をRunする。
SQL Editorの実行ロールは通常の管理用 `postgres` を使い、`anon` / `authenticated` に切り替えない。
これは新規環境に一度だけ実行するインストールSQL。

作成されるもの：10テーブル、RLSとポリシー、登録時のプロフィール作成、
管理・決済用関数、非公開の `course-media` バケット。
途中で失敗すると、このSQL内の変更はトランザクションで取り消される。
成功時は `Success. No rows returned` など、エラーのない完了表示になる。

既に成功した後にもう一度実行すると `already exists` になる。
その場合はテーブルを削除せず、次の確認SQLで状態を確認する。
それ以外のエラーが出たら、そのメッセージを共有して原因を確認する。

## 3. 作成結果を確認する

別のNew queryに、次のファイルの全文を貼ってRunする。

[作成結果の確認SQL](../supabase/sql-editor/02-verify-course-platform.sql)

**14行の `passed` が全て `true`** なら、この確認項目は通過。
確認SQLは読み取りのみなので、何度実行してもよい。
Table Editorの `public` に10テーブル、Storageに非公開の `course-media` が表示される。
これはDB設定の確認であり、実際のメール・アップロード・決済の動作確認は後で行う。

## 4. アプリに接続情報を設定する

DashboardのConnectからProject URL、Settings → API KeysからPublishable keyとSecret keyを取得する。
`.env.local` の対応する3行に値を設定する。SQL Editorには貼らない。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

このアプリのサーバー用変数名は `SUPABASE_SERVICE_ROLE_KEY` だが、値には新しいSecret keyを指定できる。
既存のlegacy `service_role` キーも同じ変数で使える。新規環境ではPublishable / Secret keyを使用する。
Secret keyを公開用変数に入れたり、チャットやGitに保存したりしない。
`.env.local` の設定後、開発サーバーを再起動する。

## 5. メール認証を設定する

AuthenticationのEmailプロバイダでメール＋パスワードの登録を有効にし、Confirm emailを有効にする。
パスワードの最小長を10以上に設定する。

Authentication → URL Configuration：

| 設定 | 値 |
|---|---|
| Site URL | `http://127.0.0.1:3000` |
| Redirect URLs | `http://127.0.0.1:3000/auth/callback**` |
| Redirect URLs（追加） | `http://localhost:3000/auth/callback**` |

今回のローカル操作は `127.0.0.1` に統一する。メール確認・再設定リンクは登録操作と同じブラウザで開く。
Supabase標準の `ConfirmationURL` を使うメールテンプレートでよい。

最初に運営者本人のアカウントだけ試す場合、Supabaseの標準メール送信は組織メンバーの
メールアドレスに制限されている。送信可能な組織メンバーのアドレスを使うか、Custom SMTPを設定する。
一般受講者へのメール送信にはCustom SMTPを設定する。ResendなどのSMTP接続情報を指定し、
必要な送信ドメイン確認を行う。既存の問い合わせフォーム用APIキー設定だけではAuthメールは設定されない。

## 6. 自分を管理者にする

1. アプリの `http://127.0.0.1:3000/register` から運営用アカウントを作成する。
2. 確認メールのリンクを同じブラウザで開き、メール確認を完了する。
3. SupabaseのAuthentication → Usersで、そのアカウントのUser UIDをコピーする。
4. 以下をNew queryに貼り、全てゼロのUUIDを自分のUIDに置き換えてRunする。

[管理者設定SQL](../supabase/sql-editor/03-promote-course-admin.sql)

**結果が1行で、`role = admin`** なら成功。0行ならUIDやメール確認状態を確認する。
他の会員は変更されない。管理者設定SQLを一般の登録者に対して実行しない。
アプリでサインアウトして再ログインし、`http://127.0.0.1:3000/admin` を開く。

## 7. 管理画面を試す

コース作成 → モジュール追加 → 小さいMP4をアップロード → レッスン追加の順に試す。
最初は50MB未満の動画を用意する。Supabase Freeの上限は1ファイル50MB。
大きい実教材はプランとStorage Settingsの全体上限を確認してから投入する。
管理者は購入なしで受講画面を確認できる。Stripeのテスト接続はその後でよい。

## 補足：後からSupabase CLIへ移る場合

SQL Editorで実行したファイルは、CLIのマイグレーション履歴には自動で登録されない。
後からCLIを使う際は、実DBとファイルを照合して履歴を同期してから次のマイグレーションを適用する。
今はSQL Editorで上の手順を進めればよい。

参考：
[SQLによるテーブル作成](https://supabase.com/docs/guides/database/tables)、
[APIキー](https://supabase.com/docs/guides/getting-started/api-keys)、
[認証の戻り先](https://supabase.com/docs/guides/auth/redirect-urls)、
[SMTP](https://supabase.com/docs/guides/auth/auth-smtp)、
[Storageのファイル上限](https://supabase.com/docs/guides/storage/uploads/file-limits)。
