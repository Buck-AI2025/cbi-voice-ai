# Stripe Payment Links (TEST MODE — sandbox acct_1UXVrSJInUo0IkYg)

Pay with test card 4242 4242 4242 4242, any future date, any CVC.
Before launch: recreate in live mode (run `node stripe/setup.mjs` with an sk_live_ key) and swap these URLs.

| Offer | Price | Link |
|---|---|---|
| App monthly (7-day trial) | $19/mo | https://buy.stripe.com/test_00w9AUd2m1SJfqN0390x200 |
| App annual (7-day trial) | $149/yr | https://buy.stripe.com/test_9B6dRa2nIbtj1zXaHN0x201 |
| Starter coaching | $297 | https://buy.stripe.com/test_fZu4gAgey2WN4M93fl0x202 |
| Transformation (pay in full) | $997 | https://buy.stripe.com/test_00w28s9Qa54VguR4jp0x203 |
| Transformation (3-pay) | 3 × $347 | https://buy.stripe.com/test_14A4gA4vQcxn0vT6rx0x204 |
| Food Freedom 90-Day (pay in full) | $3,000 | https://buy.stripe.com/test_bJe6oIbYi7d30vT8zF0x205 |
| Food Freedom 90-Day (3-pay) | 3 × $1,100 | https://buy.stripe.com/test_28E9AU7I29lbguR8zF0x206 |

## Manual step for 3-pay plans (until the webhook is built)
After each 3-pay purchase: Dashboard → Subscriptions → open it → Cancel → "At a specific date" → set to just after payment #3.
Otherwise Stripe keeps billing monthly.

## Tax
Tax codes and tax behavior (exclusive) are set on every product/price. Automatic tax is OFF until you:
1. Dashboard → Settings → Tax → add head office address.
2. Add a registration in any state where you're registered.
3. Turn on automatic tax on each link (or re-run setup.mjs).
