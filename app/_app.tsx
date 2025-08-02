import type { AppProps } from 'next/app'
import { reportWebVitals } from '@/utils/performance'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

// Export reportWebVitals for Next.js to use
export { reportWebVitals }