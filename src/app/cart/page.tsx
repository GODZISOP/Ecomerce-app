'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateCartQty, removeFromCart, cartSubtotal } = useCart();

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
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Your Health Basket / شاپنگ کارٹ
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review selected items before order confirmation
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Your Cart is Empty / کارٹ خالی ہے</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
            Aap ne abhi tak koi dawa cart mein shamil nahi ki. Hamare medicine catalog se dawai muntakhib karein.
          </p>
          <Link href="/shop" className="btn-primary" style={{ display: 'inline-flex' }}>
            Browse Shop Catalog <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        /* Full Cart View split */
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
                    background: '#fcfefe',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px'
                  }}>
                    <img 
                      src={item.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80'} 
                      alt={item.name} 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80';
                      }}
                    />
                  </div>

                  {/* Name and specification */}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '2px' }}>
                      <Link href={`/product/${item.id}`} style={{ color: 'var(--foreground)', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--foreground)'}>
                        {item.name}
                      </Link>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '4px' }}>{item.generic_name}</p>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--primary-bg)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.dosage}
                    </span>
                    {item.requires_prescription && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', marginLeft: '8px' }}>⚠️ Rx Required</span>
                    )}
                  </div>

                  {/* Qty count selector */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
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

                  {/* Total price calculation */}
                  <div style={{ textAlign: 'right', justifySelf: 'end' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>Rs. {item.price_pkr * item.quantity}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rs. {item.price_pkr} each</div>
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
              
              {/* Back to shop option inside table */}
              <div style={{ padding: '20px 24px', background: 'var(--background)' }}>
                <Link href="/shop" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}>
                  <ArrowLeft size={16} /> Continue Medicine Shopping / مزید دوائیں خریدیں
                </Link>
              </div>
            </div>
          </div>

          {/* Right panel: order summary checkout card */}
          <div className="cart-summary" style={{ flex: 0.8 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              Order Details / بل کی تفصیل
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal / کل قیمت</span>
                <span style={{ fontWeight: 700 }}>Rs. {cartSubtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping Fee / ڈلیوری فیس</span>
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
                fontWeight: 700
              }}>
                ℹ️ Flat Delivery charge across Pakistan.
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                <span style={{ fontWeight: 800 }}>Total / کل بل</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Rs. {grandTotal}</span>
              </div>
            </div>

            {/* Warning if checkout has prescription Rx required items */}
            {cart.some(i => i.requires_prescription) && (
              <div style={{
                background: 'rgba(249, 115, 22, 0.08)',
                border: '1px solid rgba(249, 115, 22, 0.2)',
                color: 'var(--accent)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                fontWeight: 600,
                lineHeight: 1.4,
                marginBottom: '24px'
              }}>
                ⚠️ Cart contains **Rx Prescription-required** medicines. Please ensure you have a digital copy of your doctor's note.
              </div>
            )}

            <button 
              className="btn-primary" 
              onClick={() => router.push('/checkout')}
              style={{ width: '100%', padding: '16px 24px', justifyContent: 'center', fontSize: '1rem' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              marginTop: '16px',
              fontWeight: 600
            }}>
              <ShieldCheck size={16} color="var(--primary)" /> Secure Checkout Powered by Cash on Delivery
            </div>

          </div>

        </div>
      )}

      {/* Cart item table layout style custom overrides */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .tab-container {
            flex-direction: column !important;
          }
          .cart-summary {
            position: relative !important;
            top: 0 !important;
            width: 100% !important;
            margin-top: 20px;
          }
          .cart-item-row {
            grid-template-columns: 80px 1.5fr 1fr 1fr 30px !important;
            padding: 16px !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
