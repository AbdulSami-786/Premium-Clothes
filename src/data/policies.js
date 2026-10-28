/**
 * Copy for the informational pages. Each entry renders through <InfoPage>,
 * so adding a policy page means adding a key here plus a route.
 */

import { ONLINE_PAYMENTS, STORE } from './config'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT_RATE, formatPrice } from '../utils/format'

export const POLICIES = {
  shipping: {
    eyebrow: 'Delivery',
    title: 'Shipping & delivery',
    intro:
      'We dispatch from Karachi within 24 hours of an order being confirmed, six days a week.',
    sections: [
      {
        heading: 'Delivery times',
        body: [
          'Karachi, Lahore and Islamabad: 2–3 working days.',
          'Other major cities: 3–5 working days.',
          'Remote areas: 5–7 working days, depending on courier coverage.',
        ],
      },
      {
        heading: 'Charges',
        body: [
          `Flat ${formatPrice(SHIPPING_FLAT_RATE)} on orders under ${formatPrice(FREE_SHIPPING_THRESHOLD)}.`,
          `Free delivery on every order of ${formatPrice(FREE_SHIPPING_THRESHOLD)} and above.`,
          'Cash on delivery is available nationwide at no extra charge.',
        ],
      },
      {
        heading: 'Tracking',
        body: [
          'A tracking number is sent by SMS and email once the parcel leaves our unit.',
          'You can also look up your order on the Account page using your order number.',
        ],
      },
      {
        heading: 'Missed deliveries',
        body: [
          'Couriers attempt delivery twice. After a second failed attempt the parcel returns to us and we will contact you to rearrange.',
          'Please make sure the phone number on your order is reachable during the day.',
        ],
      },
    ],
  },

  returns: {
    eyebrow: 'After your order',
    title: 'Returns & exchange',
    intro:
      'We want the piece to fit and to be what you expected. If it is not, here is how it works.',
    sections: [
      {
        heading: 'Stitched pieces',
        body: [
          'Exchangeable within 7 days of delivery.',
          'The garment must be unworn and unwashed, with all tags attached and in its original packaging.',
          'Exchanges are for a different size or colour of the same product, subject to availability.',
        ],
      },
      {
        heading: 'Unstitched fabric',
        body: [
          'Returnable within 7 days only if the fabric is uncut and in its sealed packaging.',
          'Once fabric has been cut or washed we cannot accept it back.',
        ],
      },
      {
        heading: 'Faulty or incorrect items',
        body: [
          'If we send the wrong item or a piece arrives with a manufacturing fault, we cover return shipping and replace it at no cost.',
          `Photograph the issue and send it to ${STORE.email} within 48 hours of delivery.`,
        ],
      },
      {
        heading: 'How to start a return',
        body: [
          `Email ${STORE.email} or message ${STORE.whatsapp} with your order number.`,
          'We arrange a courier pickup where available, or share a return address.',
          'Refunds are processed within 7 working days of the item reaching us.',
        ],
      },
    ],
  },

  faq: {
    eyebrow: 'Help',
    title: 'Frequently asked questions',
    intro: 'The questions we are asked most. If yours is not here, get in touch.',
    sections: [
      {
        heading: 'What is the difference between stitched and unstitched?',
        body: [
          'Stitched pieces arrive ready to wear in a standard size. Unstitched is fabric sold by the length, for you to have tailored to your own measurements.',
        ],
      },
      {
        heading: 'Can you stitch an unstitched suit for me?',
        body: [
          'Yes. Message us on WhatsApp after placing your order with your measurements. Stitching adds PKR 2,500–4,500 depending on the design and roughly 7 working days.',
        ],
      },
      {
        heading: 'Do the colours match the photographs?',
        body: [
          'We photograph in daylight without heavy retouching, but screens vary. If a colour matters a great deal, message us and we will describe it honestly.',
        ],
      },
      {
        heading: 'Will a sold-out design come back?',
        body: [
          'Usually not. We produce in small runs and rarely repeat a print. A restock, when it happens, is announced by email first.',
        ],
      },
      {
        heading: 'Do you ship outside Pakistan?',
        body: [
          `Not through the website yet. For international orders, email ${STORE.email} and we will quote shipping directly.`,
        ],
      },
      {
        heading: 'Which payment methods do you accept?',
        body: [
          ONLINE_PAYMENTS
            ? 'Cash on delivery, Visa and Mastercard, and mobile wallets including EasyPaisa and JazzCash.'
            : 'Cash on delivery, available nationwide. Online payment is coming soon.',
        ],
      },
    ],
  },

  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy policy',
    intro:
      'What we collect, why we collect it, and what we will never do with it.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'Your name, email, phone number and delivery address when you place an order.',
          'Basic analytics about how the site is used, which is not tied to your identity.',
        ],
      },
      {
        heading: 'How we use it',
        body: [
          'To process, pack and deliver your order, and to contact you about it.',
          'To send marketing email only if you have subscribed, with an unsubscribe link in every message.',
        ],
      },
      {
        heading: 'What we do not do',
        body: [
          'We do not sell or rent your details to anyone.',
          ONLINE_PAYMENTS
            ? 'We do not store card numbers. Card payments are handled by our payment processor.'
            : 'We do not ask for or store card details; payment is made in cash on delivery.',
        ],
      },
      {
        heading: 'Your choices',
        body: [
          `Ask us for a copy of what we hold about you, or ask us to delete it, by emailing ${STORE.email}.`,
          'Your cart is stored in your own browser and never leaves your device. If you sign in, your wishlist is saved to your account so it follows you across devices.',
        ],
      },
    ],
  },

  terms: {
    eyebrow: 'Legal',
    title: 'Terms of service',
    intro: 'The terms you agree to when you order from Premium Clothes.',
    sections: [
      {
        heading: 'Orders',
        body: [
          'An order is confirmed once you receive a confirmation email with an order number.',
          'We may cancel an order if an item is out of stock or if a pricing error is identified, and will refund you in full.',
        ],
      },
      {
        heading: 'Pricing',
        body: [
          'All prices are in Pakistani Rupees and include applicable taxes.',
          'Prices may change without notice, but never after your order is confirmed.',
        ],
      },
      {
        heading: 'Product descriptions',
        body: [
          'We describe fabrics and measurements as accurately as we can. Slight variation in shade and in hand-finished work is normal and is not a fault.',
        ],
      },
      {
        heading: 'Intellectual property',
        body: [
          'Our prints, photography and copy belong to Premium Clothes and may not be reproduced without written permission.',
        ],
      },
      {
        heading: 'Governing law',
        body: ['These terms are governed by the laws of Pakistan.'],
      },
    ],
  },
}
