import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { ShopProvider } from './context/ShopContext'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import { BackToTop, ScrollRestoration } from './components/ScrollToTop'
import Home from './pages/Home'

/* The homepage ships in the main bundle; every other route is fetched on
   demand, which keeps the first paint light on mobile connections. */
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmed = lazy(() => import('./pages/OrderConfirmed'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Account = lazy(() => import('./pages/Account'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const SizeGuide = lazy(() => import('./pages/SizeGuide'))
const InfoPage = lazy(() => import('./pages/InfoPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

/** Cross-fade between routes; short enough not to delay the new page. */
function Page({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-[60vh]"
    >
      {children}
    </motion.main>
  )
}

/** Shown only for the moment a lazy route chunk is in flight. */
function RouteFallback() {
  return (
    <div className="container-px flex min-h-[60vh] items-center justify-center py-24">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-900" />
    </div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    /* Auth wraps Shop because the wishlist merges into the account on sign-in. */
    <AuthProvider>
      <ShopProvider>
        <ScrollRestoration />
        <Header />

        <Suspense fallback={<RouteFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Page><Home /></Page>} />
              <Route path="/shop" element={<Page><Shop mode="all" /></Page>} />
              <Route
                path="/category/:slug"
                element={<Page><Shop mode="category" /></Page>}
              />
              <Route
                path="/collection/:slug"
                element={<Page><Shop mode="collection" /></Page>}
              />
              <Route path="/product/:id" element={<Page><ProductDetail /></Page>} />
              <Route path="/cart" element={<Page><Cart /></Page>} />
              <Route path="/checkout" element={<Page><Checkout /></Page>} />
              <Route path="/order-confirmed" element={<Page><OrderConfirmed /></Page>} />
              <Route path="/wishlist" element={<Page><Wishlist /></Page>} />
              <Route path="/about" element={<Page><About /></Page>} />
              <Route path="/contact" element={<Page><Contact /></Page>} />
              <Route path="/account" element={<Page><Account /></Page>} />
              <Route path="/login" element={<Page><Login /></Page>} />
              <Route path="/signup" element={<Page><Signup /></Page>} />
              <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />
              <Route path="/size-guide" element={<Page><SizeGuide /></Page>} />
              <Route path="/shipping" element={<Page><InfoPage slug="shipping" /></Page>} />
              <Route path="/returns" element={<Page><InfoPage slug="returns" /></Page>} />
              <Route path="/faq" element={<Page><InfoPage slug="faq" /></Page>} />
              <Route path="/privacy" element={<Page><InfoPage slug="privacy" /></Page>} />
              <Route path="/terms" element={<Page><InfoPage slug="terms" /></Page>} />
              <Route path="*" element={<Page><NotFound /></Page>} />
            </Routes>
          </AnimatePresence>
        </Suspense>

        <CartDrawer />
        <BackToTop />
        <Footer />
      </ShopProvider>
    </AuthProvider>
  )
}
