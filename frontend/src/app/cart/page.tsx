'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateCartQty, removeFromCart, cartSubtotal } = useCart();
  const { t } = useLanguage();

  const shippingFee = cart.length > 0 ? 150 : 0;
  const grandTotal = cartSubtotal + shippingFee;

  const handleQtyChange = (id: number, currentQty: number, change: number) => {
    const nextQty = currentQty + change;
    if (nextQty >= 1) {
      updateCartQty(id, nextQty);
    }
  };

  const handleRemove = (id: number) => {
    removeFromCart(id);
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          {t('Your Basket', 'شاپنگ کارٹ')}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {t('Review selected food items before checking out', 'چیک آؤٹ کرنے سے پہلے منتخب کردہ کھانوں کا جائزہ لیں')}
        </p>
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '80px 20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-bg)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <ShoppingCart size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>{t('Your Basket is Empty', 'کارٹ خالی ہے')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
            {t("You haven't added any pizza or burger to your basket yet.", 'آپ نے ابھی تک اپنے کارٹ میں کوئی پیزا یا برگر شامل نہیں کیا ہے۔')}
          </p>
          <Link href="/shop" className="btn-primary" style={{ display: 'inline-flex', background: 'var(--primary)', color: 'white', textDecoration: 'none' }}>
            {t('Go to Menu', 'مینو پر جائیں')} <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        /* Full Cart View */
        <div className="tab-container" style={{ display: 'flex', gap: '32px' }}>
          
          {/* Left panel: list of items */}
          <div className="cart-main" style={{ flex: 1.4 }}>
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}>
              {cart.map((item) => (
                <div key={item.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1.5fr 1fr 1fr 40px',
                  gap: '20px',
                  padding: '24px',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)'
                }} className="cart-item-row">
                  
                  {/* Image */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Name and toppings */}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '2px' }}>
                      <Link href={`/product/${item.id}`} style={{ color: 'var(--foreground)', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--foreground)'}>
                        {t(item.name)}
                      </Link>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', lineBreak: 'anywhere' }}>{t(item.generic_name)}</p>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--primary-bg)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                      {t(item.dosage)}
                    </span>
                  </div>

                  {/* Qty Selector */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--background)',
                    padding: '2px',
                    alignSelf: 'center',
                    justifySelf: 'center'
                  }}>
                    <button 
                      onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                      style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
                    >-</button>
                    <span style={{ width: '30px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                    <button 
                      onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                      style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
                    >+</button>
                  </div>

                  {/* Total price */}
                  <div style={{ textAlign: 'right', justifySelf: 'end' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>Rs. {item.price_pkr * item.quantity}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rs. {item.price_pkr} {t('each', 'فی عدد')}</div>
                  </div>

                  {/* Remove button */}
                  <button 
                    onClick={() => handleRemove(item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--status-cancelled)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              ))}
              
              {/* Back to shop */}
              <div style={{ padding: '20px 24px', background: 'var(--background)' }}>
                <Link href="/shop" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}>
                  <ArrowLeft size={16} /> {t('Back to Food Menu', 'مزید آرڈر کریں')}
                </Link>
              </div>
            </div>
          </div>

          {/* Right panel: order summary checkout card */}
          <div className="cart-summary" style={{ flex: 0.8 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              {t('Order Details', 'بل کی تفصیل')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('Subtotal', 'کل قیمت')}</span>
                <span style={{ fontWeight: 700 }}>Rs. {cartSubtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('Delivery Fee', 'ڈلیوری فیس')}</span>
                <span style={{ fontWeight: 700 }}>Rs. {shippingFee}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                🛵 {t('Flat delivery charges applied.', 'فلیٹ ڈلیوری چارجز لاگو ہیں۔')}
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                <span style={{ fontWeight: 900 }}>{t('Total', 'کل بل')}</span>
                <span style={{ fontWeight: 900, color: 'var(--primary)' }}>Rs. {grandTotal}</span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={() => router.push('/checkout')}
              style={{ width: '100%', padding: '16px 24px', justifyContent: 'center', fontSize: '1rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800 }}
            >
              {t('Proceed to Checkout', 'چیک آؤٹ کی طرف جائیں')} <ArrowRight size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              marginTop: '16px',
              fontWeight: 700
            }}>
              <ShieldCheck size={16} color="var(--primary)" /> {t('Cash on Delivery (COD) Available', 'کیش آن ڈلیوری (سی او ڈی) دستیاب ہے')}
            </div>

          </div>

        </div>
      )}

      {/* Cart item table layout style custom overrides */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .tab-container {
            flex-direction: column !important;
            gap: 20px !important;
          }
          .cart-summary {
            position: relative !important;
            top: 0 !important;
            width: 100% !important;
            margin-top: 20px;
          }
          .cart-item-row {
            display: grid !important;
            grid-template-columns: 80px 1fr 40px !important;
            grid-template-rows: auto auto auto !important;
            padding: 16px !important;
            gap: 12px !important;
            align-items: center !important;
          }
          .cart-item-row > div:nth-child(1) {
            grid-column: 1 !important;
            grid-row: 1 / span 3 !important;
            align-self: center !important;
          }
          .cart-item-row > div:nth-child(2) {
            grid-column: 2 !important;
            grid-row: 1 !important;
            justify-self: start !important;
          }
          .cart-item-row > div:nth-child(3) {
            grid-column: 2 !important;
            grid-row: 2 !important;
            justify-self: start !important;
            align-self: center !important;
            margin-top: 6px !important;
            margin-bottom: 4px !important;
          }
          .cart-item-row > div:nth-child(4) {
            grid-column: 2 !important;
            grid-row: 3 !important;
            justify-self: start !important;
            text-align: left !important;
            align-self: center !important;
            margin-top: 4px !important;
          }
          .cart-item-row > button:nth-child(5) {
            grid-column: 3 !important;
            grid-row: 1 / span 3 !important;
            justify-self: center !important;
            align-self: center !important;
          }
        }
      `}</style>
    </div>
  );
}
