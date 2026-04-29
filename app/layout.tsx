import type { Metadata } from 'next'
import '../src/styles/globals.css'
import DeviceProvider from '@components/DeviceProvider'
import AuthProvider from '@components/AuthProvider'
import Header from '@components/Header'
import Footer from '@components/Footer'

export const metadata: Metadata = {
  title: 'Pantulugaru',
  description: 'Devotional platform for professional ritual bookings and spiritual guidance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DeviceProvider>
            <Header />
            {children}
            <Footer />
          </DeviceProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
