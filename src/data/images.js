/**
 * Photography used across the site, grouped by where it is used.
 *
 * Every picture on the site now comes from the Wonder Weave fabric shoot in
 * `public/product/`. To swap a photo, drop a file into that folder and point
 * the value here at it — nothing else needs to change, every page reads from
 * this file.
 */

/* One shot per Wonder Weave colour, keyed by the colour name shown in the shop. */
export const WONDER_WEAVE = {
  White: '/product/pro-1.jpeg',
  'Dark Brown': '/product/pro-2.jpeg',
  'Off White': '/product/pro-3.jpeg',
  Maroon: '/product/pro-4.jpeg',
  Black: '/product/pro-5.jpeg',
  Grey: '/product/pro-6.jpeg',
  'Navy Blue': '/product/pro-7.jpeg',
  'Dark Green': '/product/pro-8.jpeg',
}

/* One shot per Arch colour, keyed by the colour name shown in the shop. */
export const ARCH = {
  'Army Green': '/product/pro-9.jpeg',
  'Dark Grey': '/product/pro-10.jpeg',
  Black: '/product/pro-11.jpeg',
  'Bottle Green': '/product/pro-12.jpeg',
  'Navy Blue': '/product/pro-13.jpeg',
  Brown: '/product/pro-14.jpeg',
  'Light Grey': '/product/pro-15.jpeg',
  Khaki: '/product/pro-16.jpeg',
}

/* Lazio packaging shot, used as the product's cover photo. */
export const LAZIO_BOX = '/product/pro-17.jpeg'

/* One shot per Lazio colour, keyed by the colour name shown in the shop. */
export const LAZIO = {
  White: '/product/pro-20.jpeg',
  'Navy Blue': '/product/pro-18.jpeg',
  Black: '/product/pro-19.jpeg',
}

/* One shot per Bareeze Suiting colour, keyed by the colour name shown in the shop.
   Dark Grey is the brand label card for the cloth rather than a plain folded shot. */
export const BAREEZE = {
  'Midnight Blue': '/product/pro-21.jpeg',
  Beige: '/product/pro-22.jpeg',
  'Dark Teal': '/product/pro-23.jpeg',
  'Sky Blue': '/product/pro-24.jpeg',
  Black: '/product/pro-25.jpeg',
  'Light Grey': '/product/pro-26.jpeg',
  'Dark Brown': '/product/pro-27.jpeg',
  'Navy Blue': '/product/pro-28.jpeg',
  'Olive Green': '/product/pro-29.jpeg',
  Grey: '/product/pro-30.jpeg',
  'Indigo Blue': '/product/pro-31.jpeg',
  'Dark Grey': '/product/pro-32.jpeg',
}

/* One shot per Supreme colour, keyed by the colour name shown in the shop. */
export const SUPREME = {
  'Off White': '/product/pro-33.jpeg',
  White: '/product/pro-34.jpeg',
  Cream: '/product/pro-35.jpeg',
  'Neil White': '/product/pro-36.jpeg',
}

/* Noor CTN label card (lot number, "12 colour"), used as the product's cover photo.
   It is also the Forest Green shot. */
export const NOOR_CARD = '/product/pro-37.jpeg'

/* One shot per Noor CTN colour, keyed by the colour name shown in the shop. */
export const NOOR_CTN = {
  'Forest Green': NOOR_CARD,
  'Navy Blue': '/product/pro-38.jpeg',
  Charcoal: '/product/pro-39.jpeg',
  'Light Grey': '/product/pro-40.jpeg',
  'Pale Beige': '/product/pro-41.jpeg',
  'Icy Blue': '/product/pro-42.jpeg',
  'Muted Blue': '/product/pro-43.jpeg',
  Greige: '/product/pro-44.jpeg',
  'Deep Navy': '/product/pro-45.jpeg',
  'Pearl Grey': '/product/pro-46.jpeg',
  Taupe: '/product/pro-47.jpeg',
  'Pale Sage': '/product/pro-48.jpeg',
}

/* One shot per Sherwani shade, keyed by the colour name shown in the shop. */
export const SHERWANI = {
  'Ivory Gold': '/product/sher-1.jpeg',
  Pistachio: '/product/sher-2.jpeg',
  'Off White': '/product/sher-3.jpeg',
  'Bottle Green': '/product/sher-4.jpeg',
  'Black Brown': '/product/sher-5.jpeg',
}

const W = WONDER_WEAVE
const S = SHERWANI

/* The groups below keep their original names so existing pages keep working;
   each now points at one of the Wonder Weave or Sherwani shots. */
export const WOMEN = {
  lilacFormal: W['Navy Blue'],
  redEmbroidered: W.Maroon,
  yellowFormal: W['Off White'],
  plumEveryday: W.Maroon,
  tealBridal: W['Dark Green'],
  creamSuit: W['Off White'],
  greySuit: W.Grey,
  blackEmbroidered: W.Black,
  blackFormal: W.Black,
  whiteKurta: W.White,
}

export const MEN = {
  whiteArch: S['Ivory Gold'],
  charcoalPark: S['Bottle Green'],
  whiteNight: S['Off White'],
  whiteBench: S.Pistachio,
  whiteSteps: S['Black Brown'],
}

export const FABRIC = {
  foldedBlues: W['Navy Blue'],
  shopShelves: W['Dark Brown'],
  printedStack: W.Maroon,
  warmRolls: W['Dark Brown'],
  neutralStack: W['Off White'],
}

/** Hero slides and full-bleed banners — darker shades read best under text. */
export const WIDE = {
  sherwani: S['Bottle Green'],
  womenLilac: W['Navy Blue'],
  womenRed: W.Maroon,
  menWhite: W['Dark Brown'],
  fabricShop: W['Dark Green'],
  womenCream: W.Grey,
  fabricWarm: W['Dark Brown'],
  womenYellow: W['Off White'],
}
