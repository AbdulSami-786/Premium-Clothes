/**
 * Site configuration.
 *
 * Set API_URL to the Web App URL from your Google Apps Script deployment.
 * See apps-script/README.md for how to get it.
 *
 * It must be the URL ending in /exec — the /dev one requires a Google login
 * and will not work from the site.
 *
 * Leave it as an empty string to run the storefront without a backend:
 * browsing, the cart, the local wishlist and checkout all still work, and the
 * account pages explain what is missing instead of failing.
 *
 * Note: this URL ships in the built JavaScript and is visible to anyone who
 * views the site. That is fine for an Apps Script endpoint — it is public by
 * design and the script decides what each request is allowed to do — but do
 * not put passwords, API keys or anything secret in this file.
 */
export const API_URL = ''

/** Store details used across the site. */
export const STORE = {
  name: 'Premium Clothes',
  email: 'hello@premiumclothes.pk',
  phone: '+92 21 1234 567',
  whatsapp: '+92 300 1234567',
  address: 'Shop 14, Tariq Road, Karachi, Pakistan',
}
