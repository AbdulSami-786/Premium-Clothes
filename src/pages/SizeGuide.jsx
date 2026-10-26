import { useState } from 'react'
import { Ruler } from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'

const WOMEN_SIZES = {
  headers: ['Size', 'Bust (in)', 'Waist (in)', 'Hip (in)', 'Shirt length (in)'],
  rows: [
    ['XS', '32', '26', '35', '38'],
    ['S', '34', '28', '37', '39'],
    ['M', '36', '30', '39', '40'],
    ['L', '38', '32', '41', '41'],
    ['XL', '40', '34', '43', '42'],
    ['XXL', '42', '36', '45', '42'],
  ],
}

const MEN_SIZES = {
  headers: ['Size', 'Chest (in)', 'Collar (in)', 'Kameez length (in)', 'Shalwar length (in)'],
  rows: [
    ['XS', '36', '14.5', '40', '40'],
    ['S', '38', '15', '41', '41'],
    ['M', '40', '15.5', '42', '42'],
    ['L', '42', '16', '43', '42'],
    ['XL', '44', '16.5', '44', '43'],
    ['XXL', '46', '17', '45', '43'],
  ],
}

const UNSTITCHED = {
  headers: ['Set', 'Shirt', 'Dupatta', 'Trouser', 'Suits'],
  rows: [
    ['Standard (3 pc)', '2.5 m', '2.5 m', '2.5 m', 'Up to size L'],
    ['Large (3.5 pc)', '3.0 m', '2.5 m', '2.5 m', 'Size XL and above'],
    ['Men — suit length', '4.5 m total', '—', 'Included', 'All sizes'],
  ],
}

const TABS = [
  { id: 'women', label: 'Women — stitched', table: WOMEN_SIZES },
  { id: 'men', label: 'Men — stitched', table: MEN_SIZES },
  { id: 'unstitched', label: 'Unstitched lengths', table: UNSTITCHED },
]

const TIPS = [
  {
    title: 'Measure over light clothing',
    copy: 'Keep the tape snug but not tight, and level all the way around.',
  },
  {
    title: 'Between two sizes?',
    copy: 'Go up. Our cuts sit close through the shoulder, and a tailor can always take it in.',
  },
  {
    title: 'Compare with what you own',
    copy: 'Lay a suit that fits you well flat and measure it. That is the most reliable guide.',
  },
]

export default function SizeGuide() {
  const [tab, setTab] = useState('women')
  const active = TABS.find((t) => t.id === tab)

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs trail={[{ label: 'Size Guide' }]} />

      <Reveal className="mt-6 max-w-2xl">
        <p className="eyebrow">Fit</p>
        <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-5xl">Size guide</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-500 sm:text-base">
          All measurements are body measurements in inches, not garment measurements.
          Our stitched pieces add ease on top of these numbers.
        </p>
      </Reveal>

      <div className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full border px-5 py-2.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-ink-200 text-ink-600 hover:border-ink-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr className="bg-ink-50">
              {active.table.headers.map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {active.table.rows.map((row) => (
              <tr key={row[0]} className="transition-colors hover:bg-ink-50/60">
                {row.map((cell, i) => (
                  <td
                    key={i}
                    className={`px-5 py-3.5 ${
                      i === 0 ? 'font-semibold text-ink-900' : 'text-ink-600'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {TIPS.map((tip) => (
          <div key={tip.title} className="rounded-2xl border border-ink-100 p-6">
            <Ruler size={19} className="text-gold-600" />
            <h2 className="mt-4 text-sm font-semibold text-ink-900">{tip.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{tip.copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-ink-50/70 p-6 text-sm leading-relaxed text-ink-600">
        <p className="font-semibold text-ink-900">Still unsure?</p>
        <p className="mt-2">
          Send us your measurements on WhatsApp at +92 300 1234567 and we will tell you
          which size to order. For unstitched fabric, we can also arrange stitching to
          your measurements for an additional charge.
        </p>
      </div>
    </div>
  )
}
