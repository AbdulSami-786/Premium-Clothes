/**
 * Client for the Google Apps Script backend.
 *
 * Apps Script Web Apps cannot answer a CORS preflight, so every call is sent
 * as a "simple" request: POST with Content-Type text/plain and no custom
 * headers. The body is still JSON — the server parses it either way.
 */

import { API_URL } from '../data/config'

const BASE_URL = (API_URL ?? '').trim()

/** True when a backend URL is configured. The UI degrades gracefully without one. */
export const apiConfigured = Boolean(BASE_URL)

export class ApiError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/**
 * Calls one backend action.
 * Resolves with the payload, or throws ApiError with a message fit to display.
 */
export async function callApi(action, payload = {}, { signal } = {}) {
  if (!BASE_URL) {
    throw new ApiError(
      'The store backend is not configured yet. Set API_URL in src/data/config.js.',
      'NO_BACKEND',
    )
  }

  let response
  try {
    response = await fetch(BASE_URL, {
      method: 'POST',
      // text/plain keeps this a simple request — do not change to application/json.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
      redirect: 'follow',
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Could not reach the server. Check your connection.', 'NETWORK')
  }

  if (!response.ok) {
    throw new ApiError(`Server returned ${response.status}. Please try again.`, 'HTTP')
  }

  let data
  try {
    data = await response.json()
  } catch {
    // Usually means the deployment is private and Google served a login page.
    throw new ApiError(
      'The server sent an unexpected response. Check the deployment is set to "Anyone".',
      'PARSE',
    )
  }

  if (!data.ok) throw new ApiError(data.error || 'Something went wrong.', data.code)
  return data
}

/* Named wrappers keep call sites readable and the action strings in one place. */

export const api = {
  ping: () => callApi('ping'),

  signup: (fields) => callApi('signup', fields),
  login: (email, password) => callApi('login', { email, password }),
  logout: (token) => callApi('logout', { token }),
  me: (token) => callApi('me', { token }),
  updateProfile: (token, fields) => callApi('updateProfile', { token, ...fields }),
  changePassword: (token, currentPassword, newPassword) =>
    callApi('changePassword', { token, currentPassword, newPassword }),

  requestReset: (email) => callApi('requestReset', { email }),
  verifyReset: (email, code) => callApi('verifyReset', { email, code }),
  resetPassword: (email, code, password) =>
    callApi('resetPassword', { email, code, password }),

  createOrder: (payload) => callApi('createOrder', payload),
  myOrders: (token) => callApi('myOrders', { token }),
  getOrder: (orderId, { email, token } = {}) =>
    callApi('getOrder', { orderId, email, token }),

  addReview: (token, review) => callApi('addReview', { token, ...review }),
  productReviews: (productId) => callApi('productReviews', { productId }),
  reviewSummary: (productIds) => callApi('reviewSummary', { productIds }),

  getWishlist: (token) => callApi('getWishlist', { token }),
  toggleWishlist: (token, productId) => callApi('toggleWishlist', { token, productId }),
  syncWishlist: (token, productIds) => callApi('syncWishlist', { token, productIds }),

  contact: (fields) => callApi('contact', fields),
  subscribe: (email) => callApi('subscribe', { email }),
}
