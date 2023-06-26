import Providers from '@/components/Providers'
import './globals.css'

export const metadata = {
  title: 'Friends For Life | Home',
  description: 'Welcome Friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
