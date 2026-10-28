import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
import ProductCard from '../components/ProductCard'
import { useShop } from '../context/ShopContext'
import { getProduct } from '../data/products'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Wishlist() {
  usePageTitle('Wishlist')
  const { wishlist } = useShop()
  const products = wishlist.map(getProduct).filter(Boolean)

  return (
    <div className="container-px py-8 lg:py-12">
      <Breadcrumbs trail={[{ label: 'Wishlist' }]} />

      <h1 className="mt-6 font-display text-3xl text-ink-900 sm:text-4xl">
        Wishlist
        {products.length > 0 && (
          <span className="ml-3 text-lg font-sans text-ink-400">({products.length})</span>
        )}
      </h1>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-ink-50 text-ink-300">
            <Heart size={30} />
          </div>
          <h2 className="font-display text-2xl text-ink-900">Nothing saved yet</h2>
          <p className="max-w-sm text-sm text-ink-400">
            Tap the heart on any product and it will be waiting here when you come back.
          </p>
          <Link to="/shop" className="btn-primary mt-2">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-500">
            Saved on this device. Clearing your browser data will clear this list.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
