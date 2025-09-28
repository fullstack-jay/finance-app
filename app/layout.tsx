import "./globals.css"
import { Metadata } from 'next'
import { AppProviders } from '@/contexts/app-providers'
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: {
    default: 'Financial Applications',
    template: '%s | Financial Applications'
  },
  description: 'Comprehensive financial management dashboard for tracking transactions, assets, investments, and documents',
  keywords: ['keuangan', 'dashboard', 'transactions', 'investments', 'assets', 'financial management'],
  authors: [{ name: 'Financial Applications Team' }],
  creator: 'Financial Applications',
  publisher: 'Financial Applications',
  robots: {
    index: false,
    follow: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders>
            <div className="min-h-screen bg-background">
              {children}
            </div>
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}