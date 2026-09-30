# Reen Bank — Website (from Figma)

A fully functional, responsive HTML/Tailwind/JS build of the Reen Bank Figma file
(`ReenBank-WebApp (Community)`). No build step, no backend — open it straight in
a browser or serve it locally.

## How to view it

Just double-click **`index.html`**, or, better (so relative paths & localStorage
behave correctly), serve the folder:

```bash
cd reenbank-website
python3 -m http.server 8080
# then open http://localhost:8080
```

## Pages included

| File                  | What it is                                                              |
|-----------------------|--------------------------------------------------------------------------|
| `index.html`          | Landing page — hero, services, FAQ accordion, partner logos, footer CTA |
| `register.html`       | Create account (name, email, password, terms)                          |
| `login.html`          | Sign in                                                                 |
| `reset-password.html` | Forgot-password flow — email step → new password step → confirmation   |
| `dashboard.html`      | Signed-in home — balance overview, accounts, fund/withdraw/add modals  |
| `accounts.html`       | Full accounts list with fund / withdraw / add account                  |
| `transactions.html`   | Per-account transaction history, tabbed by account                     |
| `profile.html`        | Personal info + link to reset password                                 |

**The OTP verification screen (and the OTP step of "reset password") were
intentionally left out**, per your instructions — the reset-password flow
goes straight from "enter email" to "enter new password."

## File structure

```
reenbank-website/
├── index.html / register.html / login.html / reset-password.html
├── dashboard.html / accounts.html / transactions.html / profile.html
├── README.md
└── assets/
    ├── css/style.css        shared styles + design tokens
    └── js/
        ├── app.js            shared logic: localStorage data layer (RB.*),
        │                     modal open/close, mobile-nav + accordion helpers
        ├── index.js          logic for index.html only
        ├── login.js          logic for login.html only
        ├── register.js       logic for register.html only
        ├── reset-password.js logic for reset-password.html only
        ├── dashboard.js      logic for dashboard.html only
        ├── accounts.js       logic for accounts.html only
        ├── transactions.js   logic for transactions.html only
        └── profile.js        logic for profile.html only
```

Every HTML file loads `assets/js/app.js` first (shared helpers + the data
layer), then its own matching `<page>.js` (only that page's logic — nothing
shared lives inline in the HTML anymore).

## How it works (no backend needed)

Everything is wired up with real client-side logic, persisted in the
browser's `localStorage` (see `assets/js/app.js`):

- **Register/Login** create/check a user record (demo-only auth, not secure —
  do not reuse this pattern for a real product without a real backend + hashing).
- Every new user is seeded with 3 starter accounts (Main Account, School
  Savings, Holiday Plan) so the dashboard isn't empty on first login.
- **Fund / Withdraw / Add Account** all update balances and generate
  transaction history in real time, with the same confirmation-overlay
  pattern as the Figma file.
- **Forgot password** actually updates the stored password.
- Dashboard pages redirect to `login.html` if you're not "signed in."

To start over, clear your browser's site data for this folder/host, or run
`localStorage.clear()` in the dev console.

## Where to drop in real images

Every place a real photo/logo/icon belongs has **two markers**:
1. An HTML comment right above it: `<!-- IMAGE: ... -->`
2. A visibly labelled placeholder box (dashed border, hatched background)
   so it's obvious in the browser, not just in the source.

Full list:

**Global**
- Header/sidebar/footer "logo" mark (the `rb` square icon) — appears on
  every page.

**`index.html`**
- Hero: Reen Bank credit-card mockup render (two stacked cards).
- Services: 6 icons (savings, personal loans, credit card, investments,
  bill pay, business banking).
- Partners strip: Mastercard, Visa, PayPal, Payoneer logos.
- Footer CTA: skyline/building background photo.

**`register.html` / `login.html`**
- Faint tiled banking-icon watermark pattern across the page background.

**`reset-password.html`, and the success modals on `dashboard.html` /
`accounts.html`**
- Confirmation "tick" animation/illustration (the Figma file links this to a
  LottieFiles animation — swap in a Lottie player or a static checkmark).

**`profile.html`**
- User's profile photo (currently a colored initial avatar).

## A note on fidelity

I pulled the Landing Page and Login screen pixel-for-pixel from the Figma
file via the Figma MCP integration, including exact copy, colors (`#33b786`
green / `#d4f3e7` mint / `#252525` ink / `#555` body copy), radii, and
shadows. Partway through, Figma's API hit this account's MCP rate limit
before I could pull the Register form, Dashboard, Accounts, Transactions and
Profile screens the same pixel-exact way.

Those remaining screens were built from the same design system (colors,
type, spacing, component shapes) plus the exact text, field labels and
layout positions recorded in the file's structure data — so they're faithful
in content and style, but not a 1:1 pixel export the way the landing page and
login screen are. If you re-run the Figma pull once the rate limit resets,
I'm happy to true those pages up to pixel-exact.
