# Going live: payments, email and legal

The code for real Mollie billing and real SMTP email is in place and tested against a fake Mollie API. It has not been run against a live Mollie account, because that needs your keys.

## Before launch
1. `npm install` (adds nodemailer).
2. Production PostgreSQL: set `DATABASE_URL`, run migrations.
3. Set `CLEANPROOF_DEPLOYMENT=production`, `AUTH_SECRET` (32+ chars), `APP_URL=https://thehouseofveynor.uk`.
4. Mollie: finish onboarding, then set `CLEANPROOF_PAYMENT_PROVIDER=mollie` and `MOLLIE_API_KEY` (use `test_` first, then `live_`). Webhook URL is `APP_URL/api/webhooks/mollie` and must be public https.
5. Email: set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`. Production refuses to pretend emails were sent if SMTP is missing.
6. Scheduler: call `GET /api/cron/billing` once a day with `Authorization: Bearer $CRON_SECRET`.
7. Storage: set `STORAGE_DRIVER=r2` and the S3 variables.
8. Test one real payment on `test_` key: signup, upgrade, webhook, cancel, reactivate, password reset email, contact form email.

## Known gaps
- VAT number is not published. Add it to `business-identity.ts` once registered, and confirm VAT treatment of prices.
- Legal pages are researched UK B2B drafts. Have a solicitor review them before taking payment.
