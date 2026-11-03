// Creates/reuses Stripe Products, Prices and Payment Links from catalog.json.
// Safe to re-run: everything is matched by lookup_key, nothing is duplicated.
// Usage: STRIPE_SECRET_KEY=sk_test_... node stripe/setup.mjs
import { readFileSync } from "node:fs";

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) throw new Error("Set STRIPE_SECRET_KEY (use sk_test_ first).");
const cat = JSON.parse(readFileSync(new URL("./catalog.json", import.meta.url)));

const missing = cat.products.flatMap(p => p.prices).filter(x => !Number.isInteger(x.amount_cents));
if (missing.length) throw new Error("Fill amount_cents for: " + missing.map(m => m.lookup_key).join(", "));

function form(obj, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") form(v, key, out); else out.append(key, String(v));
  }
  return out;
}
async function api(method, path, body) {
  const url = "https://api.stripe.com/v1/" + path + (method === "GET" && body ? "?" + form(body) : "");
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: method === "GET" ? undefined : form(body || {}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path}: ${json.error?.message}`);
  return json;
}

// Existing payment links, indexed by the lookup_key we stamp in metadata.
const links = {};
for (let after; ;) {
  const page = await api("GET", "payment_links", { limit: 100, starting_after: after });
  for (const l of page.data) if (l.metadata?.lookup_key && l.active) links[l.metadata.lookup_key] = l;
  if (!page.has_more) break;
  after = page.data.at(-1).id;
}

const results = [];
for (const p of cat.products) {
  const keys = p.prices.map(x => x.lookup_key);
  const existing = (await api("GET", "prices", { lookup_keys: keys, limit: 100, expand: ["data.product"] })).data;
  let productId = existing[0]?.product?.id;
  if (!productId) productId = (await api("POST", "products", { name: p.name, description: p.description, tax_code: p.tax_code })).id;

  for (const pr of p.prices) {
    let price = existing.find(e => e.lookup_key === pr.lookup_key);
    if (price && price.unit_amount !== pr.amount_cents)
      console.warn(`! ${pr.lookup_key} exists at ${price.unit_amount}c; catalog says ${pr.amount_cents}c. Prices are immutable - change lookup_key to create a new one.`);
    if (!price) price = await api("POST", "prices", {
      product: productId, currency: pr.currency, unit_amount: pr.amount_cents,
      lookup_key: pr.lookup_key, tax_behavior: cat.tax_behavior,
      recurring: pr.interval ? { interval: pr.interval } : undefined,
      metadata: pr.installments ? { installments: pr.installments } : undefined,
    });

    let link = links[pr.lookup_key];
    if (!link) {
      const recurring = !!pr.interval;
      link = await api("POST", "payment_links", {
        line_items: { 0: { price: price.id, quantity: 1 } },
        automatic_tax: { enabled: true },                 // Stripe Tax
        billing_address_collection: "required",           // needed for accurate tax
        allow_promotion_codes: true,
        phone_number_collection: { enabled: true },
        after_completion: { type: "redirect", redirect: { url: cat.success_url + "?session_id={CHECKOUT_SESSION_ID}" } },
        metadata: { lookup_key: pr.lookup_key },
        ...(recurring
          ? { subscription_data: { trial_period_days: pr.trial_days, metadata: { lookup_key: pr.lookup_key, installments: pr.installments } } }
          : { customer_creation: "always", invoice_creation: { enabled: true } }), // Invoicing: receipt-grade invoice for one-time buys
      });
    }
    results.push({ key: pr.lookup_key, url: link.url });
  }
}
console.table(results);
console.log("NOTE: 3-pay plans need a webhook (or Subscription Schedule) to cancel after the final installment.");
