import './globals.css'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap',
  variable: '--font-montserrat',  // Add this line to enable CSS variable
})

export const metadata = {
  title: 'Script Uploader',
  description: 'Upload and manage your scripts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  )
}
