/**
 * Site configuration.
 *
 * Set API_URL to the Web App URL from your Google Apps Script deployment.
 * See apps-script/README.md for how to get it.
 *
 * It must be the URL ending in /exec — the /dev one requires a Google login
 * and will not work from the site.
 *
 * Either replace the value below with the URL in quotes, or leave it as is and
 * set VITE_API_URL in a .env.local file (handy for pointing a test build at a
 * different backend without editing this file).
 *
 * Leave it empty to run the storefront without a backend:
 * browsing, the cart, the local wishlist and checkout all still work, and the
 * account pages explain what is missing instead of failing.
 *
 * Note: this URL ships in the built JavaScript and is visible to anyone who
 * views the site. That is fine for an Apps Script endpoint — it is public by
 * design and the script decides what each request is allowed to do — but do
 * not put passwords, API keys or anything secret in this file.
 */
export const API_URL =
  import.meta.env.VITE_API_URL ??
  'https://script.google.com/macros/s/AKfycbwkk_8GD9Pyv1puYgOPajc0p8EXEW4ObcefVAG62Pn5T-wZ32vTENX4UTHENlv2_W9DIQ/exec'

/** The public address of the live site — used for canonical links, the sitemap and social previews. */
export const SITE_URL = 'https://premiumclothhouse.store'

/** Store details used across the site — edit them here and every page follows. */
export const STORE = {
  name: 'Premium Clothes',
  email: 'hello@premiumclothes.pk',
  phone: '+92 21 1234 567',
  whatsapp: '+92 300 1234567',
  address: 'Shop 14, Tariq Road, Karachi, Pakistan',
}

const digits = (value) => value.replace(/\D/g, '')

/** Ready-made links built from STORE, so the visible number and the link cannot drift apart. */
export const STORE_LINKS = {
  tel: `tel:+${digits(STORE.phone)}`,
  mailto: `mailto:${STORE.email}`,
  whatsapp: `https://wa.me/${digits(STORE.whatsapp)}`,
}

/**
 * Social profiles. Paste the full profile URL for each network you use; any
 * left empty is hidden from the site (as is the Instagram strip on the home
 * page when there is no Instagram URL).
 */
export const SOCIAL = {
  instagram: '',
  facebook: '',
  twitter: '',
  youtube: '',
}

/**
 * Card and mobile-wallet checkout. Leave this false until a payment gateway is
 * connected: with it off the site offers cash on delivery only, so no customer
 * is led to believe a payment was taken when it was not.
 */
export const ONLINE_PAYMENTS = false
