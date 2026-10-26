import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { WIDE } from '../data/images'

const SLIDES = [
  {
    eyebrow: 'New in',
    title: 'The Embroidered\nSherwani',
    copy: 'All-over embroidery, a structured band collar and engraved buttons — made for weddings, Eid and formal evenings.',
    cta: { label: 'Shop sherwani', to: '/category/stitched-men' },
    alt: { label: 'Shop all', to: '/shop' },
    image: WIDE.womenLilac,
  },
  {
    eyebrow: 'Unstitched',
    title: 'The fabric.\nYour tailor.',
    copy: 'Wonder Weave suiting in eight shades and four lengths, from 4.25m to 5.5m — cut to exactly what your tailor needs.',
    cta: { label: 'Shop Wonder Weave', to: '/category/unstitched-men' },
    alt: { label: 'Shop all', to: '/shop' },
    image: WIDE.fabricShop,
  },
  {
    eyebrow: 'For Him',
    title: 'Dressed for\nthe occasion',
    copy: 'Ready-to-wear sherwanis and premium suit lengths, chosen for how they fall — not just how they photograph.',
    cta: { label: 'Shop stitched', to: '/category/stitched-men' },
    alt: { label: 'Suit lengths', to: '/category/unstitched-men' },
    image: WIDE.menWhite,
  },
]

export default function Hero() {
  const [index, setIndex] = useState(0)
  const { scrollY } = useScroll()

  /* Subtle parallax: the image drifts slower than the page as you scroll away. */
  const imageY = useTransform(scrollY, [0, 700], [0, 110])
  const contentY = useTransform(scrollY, [0, 500], [0, 60])
  const fade = useTransform(scrollY, [0, 450], [1, 0])

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6500)
    return () => clearInterval(timer)
  }, [index])

  const go = (dir) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length)
  const slide = SLIDES[index]

  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-ink-900">
      <motion.div style={{ y: imageY }} className="absolute inset-0 -top-[10%] h-[120%]">
        {SLIDES.map((s, i) => (
          <motion.img
            key={s.image}
            src={s.image}
            alt=""
            aria-hidden={i !== index}
            initial={false}
            animate={{
              opacity: i === index ? 1 : 0,
              scale: i === index ? 1 : 1.08,
            }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ))}
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/25" />

      <motion.div
        style={{ y: contentY, opacity: fade }}
        className="container-px relative flex h-full items-center"
      >
        <div className="max-w-2xl">
          <motion.p
            key={`e-${index}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-gold-400"
          >
            {slide.eyebrow}
          </motion.p>

          <motion.h1
            key={`t-${index}`}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 whitespace-pre-line text-4xl font-light leading-[1.08] text-white sm:text-6xl lg:text-7xl"
          >
            {slide.title}
          </motion.h1>

          <motion.p
            key={`c-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-6 max-w-lg text-sm leading-relaxed text-ink-200 sm:text-base"
          >
            {slide.copy}
          </motion.p>

          <motion.div
            key={`b-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link to={slide.cta.to} className="btn-gold group">
              {slide.cta.label}
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link to={slide.alt.to} className="btn-ghost">
              {slide.alt.label}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="container-px absolute inset-x-0 bottom-8 flex items-center justify-between">
        <div className="flex gap-2.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className="group h-1 overflow-hidden rounded-full bg-white/30 transition-all duration-500"
              style={{ width: i === index ? '3.5rem' : '1.5rem' }}
            >
              {i === index && (
                <motion.span
                  key={index}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 6.5, ease: 'linear' }}
                  style={{ transformOrigin: 'left' }}
                  className="block h-full w-full bg-gold-400"
                />
              )}
            </button>
          ))}
        </div>

        <div className="hidden gap-2 sm:flex">
          <ArrowButton onClick={() => go(-1)} label="Previous slide">
            <ChevronLeft size={18} />
          </ArrowButton>
          <ArrowButton onClick={() => go(1)} label="Next slide">
            <ChevronRight size={18} />
          </ArrowButton>
        </div>
      </div>
    </section>
  )
}

function ArrowButton({ children, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/30 text-white backdrop-blur transition-all duration-300 hover:border-white hover:bg-white hover:text-ink-900"
    >
      {children}
    </button>
  )
}
