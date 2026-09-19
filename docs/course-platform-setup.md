# コース機能：検証環境の準備と公開前の確認

**2026-09-19更新：以下の専用プロジェクト手順はローカル検証用。ステージング・本番にはクライアント所有の既存 `DawgStrength_dev` を使う。既存プロジェクトへ従来の初期SQLを実行せず、[クライアント環境への導入手順](client-staging-setup.md)の専用SQLを使う。**

現在のリポジトリに認証・コース管理・受講・決済連携を追加している。
2026-09-18時点：専用Supabase検証プロジェクト作成、SQL適用、会員登録・メール確認・
ログイン、管理者設定、デモ教材投入、管理画面からのMP4アップロード・レッスンへの設定、
受講画面での動画再生まで確認済み。Stripe設定とVercelデプロイは未実施。
接続情報がない状態では準備中の画面を表示し、購入や教材アクセスを許可しない。

次の作業は [ステージング移行の確認表](staging-readiness.md) を参照。

## ローカルでサンプル画面を見る

`npm run dev` で起動して `/preview` を開くと、Supabase接続前でもサンプルの受講画面・
コース概要・レッスン・教材管理・会員管理を確認できる。上部の切替リンクで画面を移動する。
説明文エディタは操作できるが、変更の保存・アップロード・購入は行わない。
動画部分は配置イメージ。実教材や実会員は読み込まない。本番モードではこのURLは404になる。

## 1. 専用のSupabase検証プロジェクト

ブラウザのSQL Editorで進める場合は、[SQL Editor用の手順書](supabase-sql-editor-setup.md)を順番に実行する。
一括作成・確認・管理者設定のSQLへのリンクをまとめてある。

1. クライアントが管理できる組織内に、このアプリ専用の検証プロジェクトを新規作成する。
   初期検証はFreeでも可能。課金プランの変更は実教材の容量を見て決める。
2. `.env.example` を参考に、Git対象外の `.env.local` に以下を設定する。
   `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`、`SUPABASE_SERVICE_ROLE_KEY`。
   サーバー用変数 `SUPABASE_SERVICE_ROLE_KEY` の値には新しいSecret keyを指定できる。
   この変数には絶対に `NEXT_PUBLIC_` を付けない。キーはチャットや要望ファイルにも保存しない。
3. SQL Editorで `supabase/migrations/202609080001_course_platform.sql` を一度適用する。
   既存の別アプリのDBに実行しない。SQL Editorで適用した後にCLIを使う場合は、先に履歴を同期する。
4. AuthのEmailプロバイダとメール確認を有効にし、パスワード最小長を10以上にする。
   Site URLは `http://127.0.0.1:3000`、Redirect URLsは `http://127.0.0.1:3000/auth/callback**` と
   `http://localhost:3000/auth/callback**` を登録する。
   公開時はコースドメインの `/auth/callback**` を追加する。
5. Authのメール送信用SMTPを設定する。既存お問い合わせ用Resend設定とは別設定。
   この実装はPKCEを使うため、登録・パスワード再設定のメールは操作した同じブラウザで開く。
   メールテンプレートはSupabaseの `ConfirmationURL` による標準フローを使用する。
6. `npm ci`、`npm run dev` で起動し、`/register` から運営用アカウントを作成・メール確認する。
   そのユーザーのUUIDを確認し、SQL Editorで次を実行する。

```sql
-- UUIDを確認済み運営アカウントの値に置き換える。
update public.course_profiles
set role = 'admin'
where id = '00000000-0000-0000-0000-000000000000';
```

一般ユーザーは自分を管理者に変更できない。役割をsignupのmetadataから設定しない。
一度サインアウトして再ログインし、`/admin` を開く。

## 2. 動画と教材

`course-media` は非公開バケット。DBマイグレーションが作成する。
ブラウザからTUSで直接送信するため、Next.jsサーバーに動画本体を経由させない。
アップロード完了とサイズ一致を確認してから教材へ紐付けられる。

- アプリ上限：MP4 5GB、JPEG/PNG/Word/PDF 25MB。
- Supabase側の全体上限がさらに適用される。Freeは1ファイル50MBまで。
  大きい動画は対応プランとStorage SettingsのGlobal file size limitの変更が必要。
- 最初は50MB未満のMP4でアップロード・中断再開・再生を確認する。
- MP4はH.264/AACなど対象端末で再生できる形式を用意する。拡張子だけでは再生互換性を保証しない。
- 自動エンコード、複数画質、DRM、動画サムネイルの自動抽出は初期実装に含まれない。
- 利用中のファイルは先に差し替え・添付解除してからアーカイブまたは削除する。
  アーカイブは保存容量を減らさない。削除はファイル本体も削除する。
- 閲覧時に権限を確認して1時間の署名付きURLを発行する。既に発行されたURLは
  失効・停止後も最長1時間使用できる。URLの共有・画面録画を完全には防げない。
- PWAはインストール・通信断案内・更新案内まで。教材・動画のオフライン保存はしない。

仕様の根拠：
[Supabaseのファイル上限](https://supabase.com/docs/guides/storage/uploads/file-limits)、
[再開可能アップロード](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)、
[PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow)。

## 3. Stripeテスト設定

1. Stripeテストモードで買い切りの商品・Priceを作成し、管理画面のコースに `price_...` を設定する。
   初回は1 Price = 1コース。サブスク・セット販売・分割払いは含まれない。
2. `.env.local` にテスト用 `STRIPE_SECRET_KEY` と `STRIPE_WEBHOOK_SECRET` を設定する。
3. ローカルではStripe CLIを認証した上で次を実行する。表示された署名シークレットを設定する。

```sh
stripe listen --forward-to localhost:3000/api/stripe/webhook \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,charge.refunded,charge.dispute.created
```

4. 公開検証URLでは `/api/stripe/webhook` に同じイベントのWebhook送信先を登録する。
   CLI用と公開送信先の署名シークレットは別物。
5. コースとモジュール・動画付きレッスンを公開し、一般アカウントから購入する。
   実際のコースからCheckoutを開くこと。単独のCLIサンプルイベントには必要な注文metadataがない。
6. `/success` は本人の注文をポーリングする。決済からの戻りURLだけでは権限を付与しない。
   Webhook失敗はStripeが再送でき、管理画面 `/admin/activity` からも失敗イベントを再処理できる。

支払い確認で期限なしの権限を付与する。全額返金は該当購入による権限を停止、
一部返金は維持、異議申し立ては停止する暫定方針。異議申し立て終了時の自動復旧は未実装。
解決後はStripeで確認して運営が理由付きで手動付与する。公開前にこの運用方針を確定する。
別の購入・移行・手動付与による権限は、1件の返金で一緒に取り消さない。
アカウント全体の停止は会員管理から行う。

## 4. 既存サイトとドメイン

同じリポジトリ・デプロイへ販売サイトとコースドメインを割り当てられる。
別ホストの場合は次をビルド環境に設定する。

```dotenv
NEXT_PUBLIC_SITE_URL=https://dawgstrength.com/
NEXT_PUBLIC_COURSE_URL=https://course.dawgstrength.com/
```

コースホストの `/` は `/learn` に移動する。販売サイトの `/checkout` はコースホストへ移動し、
そこで登録・ログインして購入する。Cookieを親ドメインで共有しない。
ドメイン設定はコードへの反映のみで、DNS/Vercelの変更は未実施。
`NEXT_PUBLIC_*` の変更後は再ビルドする。

**既存のゲスト決済APIは410に変更済み。未設定のまま本番へデプロイすると既存購入導線が使えない。**
`NEXT_PUBLIC_STRIPE_PRICE_ID` に既存販売導線に対応する買い切りPriceを設定し、同じPriceを
公開コースに紐付けてから切り替える。既存サイトの価格表示もStripe実価格と照合する。
進行中の旧決済や既存購入者は新会員に自動では引き継がれないため、切替時点と移行対象を確認する。

## 5. 検証と残る受け入れ確認

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

DBテストはPGliteのPostgreSQLに本物のマイグレーションを適用し、Auth/Storageの基盤だけを
テスト用に再現する。Supabaseサービス全体のテストではない。
ブラウザスモークテストは公開キー等を空にして未設定時の安全な動作をデスクトップ・スマホで確認する。

実環境では次を確認してから公開する。

- 登録メール、重複登録、ログイン、ログアウト、パスワード再設定、停止アカウント。
- コース・モジュール・レッスン・説明文・添付・並べ替え・下書き・公開・アーカイブ。
- 動画中断再開、再読込後の再開、アップロード失敗の復旧、差し替え・削除、長時間再生。
- 未購入・別コース購入・停止会員で、DB/API/Storageの直接取得が拒否されること。
- テスト購入、二重送信、遅延支払い、Webhook再送・失敗後復旧、返金、異議申し立て。
- iPhone/iPad/Android実機の動画・PWA起動・通信断・ログアウト後の表示。
- CC360の教材と受講者一覧を入手し、移行内容・照合方法・切替後の問い合わせ対応を決める。

実教材や参考画像が未提供のため円形表示は初期案。12モジュールを超える場合は一覧を使う。
管理一覧にはDB APIの件数上限があるため、大量教材の移行前にはページ分割を追加する。
計算機の移植、AI、チャット、奥様向け環境は後続作業として分けている。
