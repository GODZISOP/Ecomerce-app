import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AIChatAssistant from '@/components/AIChatAssistant';
import LocationModal from '@/components/LocationModal';

export const metadata: Metadata = {
  title: 'Fatpizza Pakistan | Online Pizza & Burger Delivery',
  description: 'Order fresh & hot pizza and burgers online in Pakistan with Cash on Delivery (COD). Get expert AI assistant recommendations. Delivered directly to your doorstep in Karachi, Lahore, Islamabad, and DHA/Gulberg.',
  keywords: 'pizza delivery, online burger ordering, fatpizza, fast food pakistan, cod pizza delivery',
  openGraph: {
    title: 'Fatpizza Pakistan | Online Pizza & Burger Ordering',
    description: 'Fresh and hot pizzas and burgers delivered directly to your home. Chat with our AI assistant to order instantly.',
    images: [{ url: 'https://images.unsplash.com/photo-1571066811602-71683a3f680d?w=1200&q=80' }]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <LanguageProvider>
          <CartProvider>
            <LocationModal />
            <Header />
            <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
              {children}
            </main>
            <Footer />
            <AIChatAssistant />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
