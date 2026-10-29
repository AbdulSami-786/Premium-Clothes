# Premium Clothes

An e-commerce storefront for stitched and unstitched shalwar kameez, built with
React, Vite and Tailwind CSS.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

The storefront runs on its own. Accounts, orders, reviews and the synced
wishlist need the Google Sheets backend — see **Backend** below.

## What is in here

| Route | Page |
| --- | --- |
| `/` | Home — hero slider, categories, featured products, collections, reviews |
| `/shop` | Full catalogue with filters and sorting |
| `/category/:slug` | One of the three categories |
| `/collection/:slug` | A seasonal collection |
| `/product/:id` | Product detail, gallery, variants, reviews |
| `/cart`, `/checkout`, `/order-confirmed` | Purchase flow |
| `/wishlist`, `/account` | Saved items, order history and order lookup |
| `/login`, `/signup`, `/forgot-password` | Accounts and password reset |
| `/about`, `/contact`, `/size-guide` | Brand and help pages |
| `/shipping`, `/returns`, `/faq`, `/privacy`, `/terms` | Policy pages |

Anything else renders the 404 page.

### Categories

Three sections, matching the navbar tabs: **Shalwar Kameez**, **Sherwani** and
**Unstitched**. A category with no products shows a "coming soon" message;
add a line with that `category` in `src/data/products.js` and it fills in
automatically. Old
`/category/stitched-men` and `/category/unstitched-men` links still work.

## Changing the content

Almost everything you will want to edit lives in three files:

- **`src/data/products.js`** — categories, collections and every product
  (name, price, fabric, colours, sizes, description, details).
- **`src/data/images.js`** — all photography, grouped by what it shows. To use
  your own pictures, drop them in `public/product/` and replace the values
  here with paths like `/product/pro-1.jpeg`. Nothing else needs to change.
- **`src/data/policies.js`** — the copy for the shipping, returns, FAQ,
  privacy and terms pages.
- **`src/data/config.js`** — the backend URL, your shop's contact details and
  social links. The phone, email and address you set here are used on every
  page, including the policy pages.

Prices are plain numbers in rupees; `src/utils/format.js` handles the
formatting, along with the free-delivery threshold and flat shipping rate.

> **If you connect the backend, prices live in two places.** The server charges
> from the `CATALOG` list in `apps-script/Code.gs`, which must match
> `products.js`. See *When you change a price or a length* in
> [apps-script/README.md](apps-script/README.md).

## Cart, wishlist and orders

Cart and wishlist state lives in `src/context/ShopContext.jsx` and persists to
`localStorage`, so it survives a refresh. Every storage access is wrapped in a
`try/catch` — in a private window the site still works, it just will not
remember anything.

Cart lines store a product id plus the chosen size and colour, and look the
product up at render time. Editing a price in `products.js` is therefore
reflected everywhere immediately, and a line whose product no longer exists is
dropped rather than crashing the cart.

## Backend

`apps-script/Code.gs` is a Google Apps Script Web App backed by a Google Sheet.
It handles accounts, password reset by emailed code, orders, reviews, the
wishlist, contact messages and newsletter signups — free to run, and the sheet
doubles as your admin panel.

**[apps-script/README.md](apps-script/README.md) has the full setup**, which
takes about ten minutes. In short: create a Sheet, paste in `Code.gs`, run
`setup`, deploy as a Web App with access set to *Anyone*, then paste the
`/exec` URL into `src/data/config.js`:

```js
export const API_URL = 'https://script.google.com/macros/s/AKfycb.../exec'
```

That URL ships in the built JavaScript and is visible to anyone viewing the
site. That is fine for an Apps Script endpoint — it is public by design, and
the script decides what each request may do — but keep passwords and API keys
out of that file.

### Without a backend

Every page still works. Browsing, the cart, the local wishlist and checkout all
run as before — orders are kept in `localStorage` instead of a sheet. The
account pages explain what is missing rather than failing on submit, so you can
develop the storefront before setting any of this up.

### Running the shop from the sheet

Change an order's `status` cell to `Packed`, `Shipped` or `Delivered` and the
customer sees it on their account page. Set a review's `status` to `Hidden` to
unpublish it. Download the Newsletter tab to export your mailing list.

## Going live checklist

1. **Your real details** in `src/data/config.js`: `STORE` (phone, WhatsApp,
   email, address) is still placeholder text, and so is `REPLY_TO` in
   `apps-script/Code.gs` — set it to an inbox you read.
2. **Social links**: paste your profile URLs into `SOCIAL` in the same file.
   Empty ones are hidden, and the home-page Instagram strip appears once
   `instagram` is set.
3. **Payments**: the site offers cash on delivery only. When a gateway is
   connected, set `ONLINE_PAYMENTS = true` in `config.js` to show card and
   wallet options (the payment itself still has to be built).
4. **Hosting**: `npm run build`, then upload `dist/`. The site uses clean URLs,
   so the host must serve `index.html` for every path. `public/_redirects`
   (Netlify, Cloudflare Pages) and `vercel.json` (Vercel) already do this; on
   other hosts add the equivalent rewrite.
5. **Backend**: after any change to `apps-script/Code.gs`, redeploy it as a new
   version. If you change a price in `products.js`, change `CATALOG` in
   `Code.gs` too.
6. **Test once for real**: place a cash-on-delivery order, check the Orders
   sheet and the confirmation email, then delete the test rows.
7. Home-page claims you have not confirmed (the "24 years" and timeline on the
   About page, the "eleven pairs of hands" banner) are yours to verify.

## SEO

The live address is set once, as `SITE_URL` in `src/data/config.js`
(`https://premiumclothhouse.store`). Every URL's title, description, preview
image and structured data come from one function, `routeMeta()` in
`src/data/seo.js`.

`npm run build` does two things: builds the app, then
`scripts/prerender.mjs` writes a static HTML page for each indexable URL (so
Google, WhatsApp and Facebook read the right tags without running JavaScript),
plus `sitemap.xml` and `robots.txt`. A new product or collection is picked up
automatically on the next build — no SEO file to edit. Always deploy with
`npm run build`, not `build:app`.

- Cart, checkout, account, sign-in, search results and unknown URLs are
  `noindex`; a category with no products stays `noindex` until it has some.
- Products carry Product structured data with price and availability; no
  ratings are published until real reviews exist.
- After going live, add the site in Google Search Console, submit
  `https://premiumclothhouse.store/sitemap.xml`, and add a Google Business
  Profile for the Tariq Road shop once its real address is confirmed.

## What is not wired up

- **Payment.** Orders are recorded, not charged. Cash on delivery works as-is;
  card and wallet payments need a real gateway.
- **Shipment tracking numbers.** The status field is updated by hand in the
  sheet rather than pulled from a courier API.

## Notes on the front end

- **Animation** uses Framer Motion, restricted to transform and opacity so it
  stays on the compositor. `prefers-reduced-motion` is respected globally in
  `src/index.css`.
- **Routing** is code-split: the homepage ships in the main bundle and every
  other route loads on demand.
- **Images** in the first row of any grid load eagerly; the rest are lazy.
- **Responsive** from 390px up, with a drawer nav and bottom-sheet filters on
  small screens and a mega-menu on desktop.

## Stack

React 19, Vite, Tailwind CSS 3, React Router, Framer Motion, Lucide icons.
Backend: Google Apps Script with Google Sheets for storage.
