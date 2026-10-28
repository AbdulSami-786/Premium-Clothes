import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, Scissors, Sparkles, Users } from 'lucide-react'
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { FABRIC, WIDE, WOMEN } from '../data/images'

const VALUES = [
  {
    icon: Scissors,
    title: 'Cut in-house',
    copy: 'Every pattern is drafted and graded by our own team, so a size M means the same thing across the range.',
  },
  {
    icon: Leaf,
    title: 'Fabric first',
    copy: 'We buy from the same four mills we started with, and reject a lot more rolls than we accept.',
  },
  {
    icon: Users,
    title: 'Paid fairly',
    copy: 'Our tailors are salaried, not paid per piece. It shows in the finishing.',
  },
  {
    icon: Sparkles,
    title: 'Small runs',
    copy: 'Limited quantities per print. When a design sells out, it usually stays sold out.',
  },
]

const TIMELINE = [
  {
    year: '2001',
    title: 'A single shop on Tariq Road',
    copy: 'Started as a fabric counter with two tailors working from a back room.',
  },
  {
    year: '2009',
    title: 'The first stitched line',
    copy: 'Customers kept asking for ready-made. We built a small stitching unit to answer that.',
  },
  {
    year: '2016',
    title: 'Nationwide delivery',
    copy: 'Partnered with couriers to reach forty cities, with cash on delivery from day one.',
  },
  {
    year: '2024',
    title: 'Online, properly',
    copy: 'The full catalogue online, with the same fabric and the same tailors behind it.',
  },
]

export default function About() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden bg-ink-900">
        <img
          src={WIDE.fabricShop}
          alt=""
          className="h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-ink-950/30" />

        <div className="container-px absolute inset-0 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <p className="eyebrow text-gold-400">Our story</p>
            <h1 className="mt-4 text-4xl font-light leading-tight text-white sm:text-5xl lg:text-6xl">
              Twenty-four years of getting the fit right
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-200 sm:text-base">
              We began as a fabric counter in Karachi. The stitching came later, because
              our customers asked for it — and because we could not find anyone else who
              would finish a suit the way we wanted.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container-px py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow">What we make</p>
            <h2 className="mt-4 text-3xl leading-tight text-ink-900 sm:text-4xl">
              Two lines, one standard
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-600">
              <p>
                Our unstitched line is fabric, sold by the length, for the tailor you
                already trust. Our stitched line is the same fabric, cut and finished in
                our own unit for people who would rather skip that step.
              </p>
              <p>
                The difference between the two is convenience, not quality. A stitched
                suit and an unstitched length of the same cloth come off the same roll,
                pass the same inspection and are packed by the same hands.
              </p>
              <p>
                We keep production deliberately small. It means we sell out, and it means
                we sleep at night.
              </p>
            </div>
            <Link to="/shop" className="btn-primary mt-8">
              See the collection
            </Link>
          </Reveal>

          <Reveal delay={0.15} className="grid grid-cols-2 gap-4">
            <img
              src={FABRIC.printedStack}
              alt="Unstitched fabric"
              loading="lazy"
              className="aspect-[3/4] w-full rounded-2xl object-cover"
            />
            <img
              src={WOMEN.creamSuit}
              alt="Stitched suit"
              loading="lazy"
              className="mt-10 aspect-[3/4] w-full rounded-2xl object-cover"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-ink-50/60 py-20 lg:py-28">
        <div className="container-px">
          <SectionHeading
            eyebrow="How we work"
            title="Four things we will not compromise on"
          />

          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, copy }) => (
              <RevealItem
                key={title}
                className="rounded-2xl border border-ink-100 bg-white p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-50 text-gold-600">
                  <Icon size={21} />
                </span>
                <h3 className="mt-5 font-display text-xl text-ink-900">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{copy}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="container-px py-20 lg:py-28">
        <SectionHeading eyebrow="Milestones" title="How we got here" />

        <div className="relative mx-auto max-w-3xl">
          <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-ink-200 sm:left-1/2" />

          {TIMELINE.map((item, i) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={`relative mb-10 pl-8 last:mb-0 sm:w-1/2 sm:pl-0 ${
                i % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:ml-auto sm:pl-12'
              }`}
            >
              <span
                className={`absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-white bg-gold-500 ring-1 ring-ink-200 sm:left-auto ${
                  i % 2 === 0 ? 'sm:-right-[7px]' : 'sm:-left-[7px]'
                }`}
              />
              <p className="font-display text-2xl text-gold-600">{item.year}</p>
              <h3 className="mt-1.5 font-display text-xl text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-100">
        <div className="container-px py-20 text-center lg:py-24">
          <Reveal className="mx-auto max-w-xl">
            <h2 className="text-3xl leading-tight text-ink-900 sm:text-4xl">
              Come see the fabric for yourself
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-500">
              The Tariq Road shop is open seven days a week. Or order online and we will
              have it with you in a few days.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/shop" className="btn-primary">
                Shop online
              </Link>
              <Link to="/contact" className="btn-outline">
                Visit us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
