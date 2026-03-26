# BeeYuan Web + Supabase Auth

This project now includes:

- Hidden login page: `/login`
- Member profile page: `/member`
- Product activation page: `/activate`
- Admin activation code page: `/admin/codes` (admin + GitHub second-step required)
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
```

## 2) Supabase SQL setup

In Supabase Dashboard -> SQL Editor, run:

- [`supabase/setup.sql`](./supabase/setup.sql)
- [`supabase/product_activation.sql`](./supabase/product_activation.sql)

When you update SQL scripts later, re-run them in SQL Editor (they are written to be idempotent with `if not exists` / `create or replace`).

This creates:

- `public.member_profiles`
- `role` (`member` / `admin`)
- `membership_tier` (`member` / `product_member`)
- `public.activation_codes` + `public.activation_events`
- RPC: `redeem_activation_code`
- RPC: `admin_generate_activation_codes`
- RLS policies for per-user profile read/write
- Privileged-field guards (members cannot self-promote role/tier)
- Activation redeem rate-limit logs (`activation_redeem_attempts`)

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

## Product activation flow

1. Admin opens `/admin/codes`
2. Generate random activation codes
3. Export CSV (code + activation URL)
4. Put code/QR in shipped product
5. User opens QR (`/activate?code=...`)
6. User login/register and redeem
7. Account upgrades to `product_member`
