# Stripe setup (TEST MODE, sandbox acct_1UXVrSJInUo0IkYg)

Test card: 4242 4242 4242 4242, any future date, any CVC, any ZIP.

## App plans (product prod_VYrseaeZCMiAzq, statement name 15SEC-SHFT)
| Plan | Price ID | Lookup key | Payment link (7-day trial) |
|---|---|---|---|
| Monthly $4.79 | price_1UXmfWJInUo0IkYgmnWG79Vy | tym_app_monthly | https://buy.stripe.com/test_aFa6oI7I2gNDguR0390x207 |
| Yearly $41.99 | price_1UXmgAJInUo0IkYgOWIfFyqj | tym_app_annual | https://buy.stripe.com/test_cNi8wQ6DY7d392p2bh0x208 |

Archived (inactive): old $19/mo, $149/yr and a duplicate $4.79 price. Coaching links deactivated;
coaching is booked through the in-app calendar.

## Before taking real money
- Activate the live account (business details, identity, bank account for payouts).
- Settings → Public details: statement descriptor 15SEC-SHFT (must match your business/DBA name).
- Settings → Payouts: payout statement descriptor (optional).
- Recreate products, prices, links in live mode and swap URLs on the landing page.
- App needs a webhook (checkout.session.completed, customer.subscription.updated/deleted,
  invoice.payment_failed) to unlock and re-lock the coach.
- Billing → Revenue recovery: Smart Retries + failed-payment emails ON.
- Settings → Billing → Customer portal: ON so subscribers can cancel/update cards.

## In-app checkout (Bolt)
Payment links (active, 7-day trial built in):
- Monthly: https://buy.stripe.com/test_aFa6oI7I2gNDguR0390x207
- Yearly:  https://buy.stripe.com/test_cNi8wQ6DY7d392p2bh0x208
Append ?client_reference_id=<APP_USER_ID>&prefilled_email=<EMAIL> so the webhook can match the payment to the user.
The trial lives on the LINK, not the price. If Bolt builds its own Checkout Session from price IDs instead,
it must send subscription_data.trial_period_days = 7.
The landing page no longer links to Stripe; its buttons point to #download (the app).
