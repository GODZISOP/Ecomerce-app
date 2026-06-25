'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check, Calendar, MapPin, Phone, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface OrderItem {
  id: number;
  name: string;
  generic_name: string;
  dosage: string;
  price_pkr: number;
  quantity: number;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  grand_total: number;
  status: string;
  tracking_code: string;
  created_at: string;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code') || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!code) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('tracking_code', code)
          .single();

        if (data) {
          setOrder(data);
        }
      } catch (e) {
        console.error('Error loading order summary:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [code]);

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '60px 24px 100px 24px', maxWidth: '800px', textAlign: 'center' }}>
        <p>Receipt Loading...</p>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Order Tracking Code Missing</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>No order summary reference provided.</p>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
          Return to Home Page
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 24px 100px 24px', maxWidth: '800px' }}>
      
      {/* Success Top Card */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '50px 40px',
        textAlign: 'center',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--foreground)', marginBottom: '4px', lineHeight: 1.25 }}>
            Thank You! / شکریہ
          </h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '12px' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: 'var(--primary)', fontSize: '1.25rem', marginBottom: '20px', fontWeight: 800 }}>
            آرڈر کامیابی سے موصول ہو گیا ہے!
          </p>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 30px auto', lineHeight: 1.6 }}>
            Our kitchen has started preparing your order! We guarantee fresh, hot pizza and burgers delivered in **30 minutes** or it's free. We will contact you if we need any delivery directions.
          </p>

          {/* Tracking box */}
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'var(--background)',
            border: '1px solid var(--border-color)',
            padding: '16px 30px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '10px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              TRACKING REFERENCE CODE / ٹریکنگ کوڈ
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{code}</span>
              <button 
                onClick={handleCopyCode}
                style={{
                  background: 'white',
                  border: '1px solid var(--border-color)',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--foreground)'
                }}
                title="Copy code"
              >
                {copied ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Use this code to track your order status live.
          </div>
        </div>
      </div>

      {/* Order Summary Receipt Panel */}
      {order && (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          padding: '40px',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            Order Receipt / رسید کی تفصیل
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Deliver to:</span><br />
                <strong style={{ color: 'var(--foreground)' }}>{order.customer_name}</strong><br />
                <span>{order.address}, {order.city}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Phone size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Contact Phone:</span><br />
                <strong style={{ color: 'var(--foreground)' }}>{order.phone}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Calendar size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Order Date:</span><br />
                <strong style={{ color: 'var(--foreground)' }}>{new Date(order.created_at).toLocaleDateString('en-PK')}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>FOOD ITEMS ORDERED</span>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ fontWeight: 800 }}>{item.name}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({item.dosage})</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '12px' }}>x{item.quantity}</span>
                </div>
                <span style={{ fontWeight: 800 }}>Rs. {item.price_pkr * item.quantity}</span>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '20px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>Rs. {order.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery charges:</span>
              <span style={{ fontWeight: 600 }}>Rs. {order.shipping_fee}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
              <span style={{ fontWeight: 900 }}>Amount Payable (COD):</span>
              <span style={{ fontWeight: 900, color: 'var(--primary)' }}>Rs. {order.grand_total}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => router.push(`/tracking?code=${code}`)} 
          className="btn-primary"
          style={{ padding: '14px 28px', fontSize: '0.95rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 800 }}
        >
          Track Order Progress <ArrowRight size={16} />
        </button>

        <button 
          onClick={() => router.push('/shop')} 
          style={{
            background: 'white',
            color: 'var(--foreground)',
            border: '1px solid var(--border-color)',
            padding: '14px 28px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'var(--transition-fast)'
          }}
        >
          Go Back to Menu
        </button>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        color: 'var(--text-muted)',
        fontSize: '0.78rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 700
      }}>
        <ShieldCheck size={16} color="var(--primary)" /> Fatpizza Fresh & Hot Guarantee. Handcrafted pizza made daily.
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <p>Receipt Loading...</p>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
