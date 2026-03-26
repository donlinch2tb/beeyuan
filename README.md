# BeeYuan Web + Supabase Auth

This project now includes:

- Hidden login page: `/login`
- Member profile page: `/member`
- Product activation page: `/activate`
- Admin activation code page: `/admin/codes` (admin + GitHub second-step required)
- Admin support page: `/admin/support` (admin + GitHub second-step required)
- Supabase auth:
  - Public users: no login required for normal browsing
  - Member users: email/password login
  - Admin users: email/password + second-step GitHub identity verification
- Logged-in member indicator in navbar (no login prompt shown when logged out)

## 1) Environment setup

1. Copy `.env.example` to `.env.local`
2. Fill in:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_APP_BASE_URL=https://www.bee-yuan.com
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

## 2) Supabase SQL setup

In Supabase Dashboard -> SQL Editor, run:

- [`supabase/setup.sql`](./supabase/setup.sql)
- [`supabase/product_activation.sql`](./supabase/product_activation.sql)
- [`supabase/maintenance_heartbeat.sql`](./supabase/maintenance_heartbeat.sql)

When you update SQL scripts later, re-run them in SQL Editor (they are written to be idempotent with `if not exists` / `create or replace`).

This creates:

- `public.member_profiles`
- `role` (`member` / `admin`)
- `membership_tier` (`member` / `product_member`)
- `public.activation_codes` + `public.activation_events`
- `public_serial` for post-sale support tracking
- RPC: `redeem_activation_code`
- RPC: `admin_generate_activation_codes`
- RPC: `my_owned_products`
- Heartbeat logs: `public.system_heartbeat_log` + `public.system_heartbeat_state`
- RPC: `run_system_heartbeat` + `cleanup_system_heartbeat_log`
- RLS policies for per-user profile read/write
- Privileged-field guards (members cannot self-promote role/tier)
- Activation redeem rate-limit logs (`activation_redeem_attempts`)
- Supabase Cron jobs:
  - `beeyuan-heartbeat-every-6h`
  - `beeyuan-heartbeat-cleanup-daily`

## 3) Enable auth providers

In Supabase Dashboard -> Authentication -> Providers:

1. Enable `Email` provider (for general members/admin first-step login)
2. Enable `GitHub` provider (for admin second-step verification)
3. Set allowed redirect URL:
   - `http://localhost:5173/member` (local dev)
   - your production `/member` URL later
4. In `Authentication -> Sign In / Providers`, turn on `Allow manual linking`

## 4) Promote first admin account

After first signup/login, find the user UUID in `auth.users`, then run:

```sql
update public.member_profiles
set role = 'admin'
where user_id = 'YOUR_AUTH_USER_UUID';
```

## 5) Development

```bash
npm install
npm run dev
```

## 6) 驗證 Heartbeat 自動化（中文）

執行 `supabase/maintenance_heartbeat.sql` 後，請到 Supabase SQL Editor 驗證：

```sql
-- 1) 最新狀態（應看到 last_run_at 與 total_runs）
select * from public.system_heartbeat_latest;

-- 2) 最近 Heartbeat 紀錄
select source, member_profiles_count, activation_codes_count, created_at
from public.system_heartbeat_log
order by created_at desc
limit 10;

-- 3) 確認 Cron 工作已註冊
select jobid, jobname, schedule, active
from cron.job
where jobname like 'beeyuan-heartbeat%';
```

可選：手動觸發一次

```sql
select * from public.run_system_heartbeat('manual-check');
```

## 7) 後台一鍵開關（/admin/maintenance）

管理員完成 GitHub 第二級驗證後，可進入：

- `/admin/maintenance`

此頁可操作：

- 一鍵啟用整套追蹤（heartbeat + 前台頁面追蹤 + admin 頁面/操作追蹤）
- 一鍵暫停整套追蹤
- 立即手動執行一次 heartbeat
- 查看最後執行時間、來源、累積次數
- 觀察最近 24h 活躍數據（頁面瀏覽量、熱門頁面、admin 操作）
- 查看最近產碼操作紀錄（誰在何時產生了哪一批）

若你曾看到以下錯誤：

- `permission denied for table job`
- `column reference "schedule" is ambiguous`

請直接重新執行 `supabase/maintenance_heartbeat.sql`（已修正為不直接讀寫 `cron.job`）。

## 8) 0 元安全上線（建議）

1. Cloudflare 建立 Turnstile（免費）並把 Site Key 填到 `.env.local` 的 `VITE_TURNSTILE_SITE_KEY`
2. Supabase Authentication 開啟（或維持）登入/註冊的 Rate Limit
3. Cloudflare 對 `/login`、`/admin*`、`/api*` 加上免費防護規則（至少 challenge + 速率限制）

註記：

- 前端 Turnstile 可有效降低機器人噪音，但最終安全仍以平台層限流與驗證為主。
- 未設定 `VITE_TURNSTILE_SITE_KEY` 時，登入頁會自動退回為不啟用 Captcha。

## Product activation flow

1. Admin opens `/admin/codes`
2. Generate random activation codes + public serials
3. Export CSV (public serial + code + activation URL)
4. Put code/QR in shipped product
5. User opens QR (`/activate?code=...`)
6. User login/register and redeem
7. Code is bound to that account (cannot be claimed by another account)
8. Account upgrades to `product_member`

## Admin support console (MVP)

`/admin/support` supports:

- Lookup by `public_serial` or owner email
- Transfer ownership to another account email
- Revoke serial
- Reissue new code/serial for support cases
- Recent support action logs
