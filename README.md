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
**Unstitched**. Shalwar Kameez has no products yet, so its page shows a
"coming soon" message; add a line with `category: 'shalwar-kameez'` in
`src/data/products.js` and it fills in automatically. Old
`/category/stitched-men` and `/category/unstitched-men` links still work.

## Changing the content

Almost everything you will want to edit lives in three files:

- **`src/data/products.js`** — categories, collections and every product
  (name, price, fabric, colours, sizes, description, details).
- **`src/data/images.js`** — all photography, grouped by what it shows. To use
  your own pictures, drop them in `public/products/` and replace the values
  here with paths like `/products/aurina-1.jpg`. Nothing else needs to change.
- **`src/data/policies.js`** — the copy for the shipping, returns, FAQ,
  privacy and terms pages.
- **`src/data/config.js`** — the backend URL and your shop's contact details.

Prices are plain numbers in rupees; `src/utils/format.js` handles the
formatting, along with the free-delivery threshold and flat shipping rate.

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
