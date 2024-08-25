import Providers from '@/components/Providers'
import { DarkModeProvider } from './(dashboard)/dashboard/darkmode'
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
        <DarkModeProvider>
          <Providers>{children}</Providers>
        </DarkModeProvider>
      </body>
    </html>
  )
}
