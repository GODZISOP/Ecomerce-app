import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AIChatAssistant from '@/components/AIChatAssistant';

export const metadata: Metadata = {
  title: 'MediMart Pakistan | Online Pharmacy & Authentic Medicines',
  description: 'Order authentic medicines online in Pakistan with Cash on Delivery (COD). Get expert AI pharmacist advice on symptoms. Authentic drugs with N-Rx labels delivered directly to your doorstep in Karachi, Lahore, Islamabad, and nationwide.',
  keywords: 'pharmacy pakistan, online medicine, panadol, augmentin, blood pressure pills, cod delivery medicine, medimart karachi lahore islamabad, symptoms checker ai',
  openGraph: {
    title: 'MediMart Pakistan | Online Pharmacy',
    description: 'Authentic medicines delivered directly to your home. Chat with our AI Pharmacist to check symptoms and order instantly.',
    images: [{ url: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=1200&q=80' }]
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
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
