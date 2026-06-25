'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ClipboardList, Clock, Truck, ShieldCheck, MapPin, Phone, HelpCircle, PackageOpen, Flame } from 'lucide-react';
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
  status: 'Pending' | 'Dispatched' | 'Delivered' | 'Cancelled';
  tracking_code: string;
  created_at: string;
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialCode = searchParams.get('code') || '';
  const [trackingInput, setTrackingInput] = useState(initialCode);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialCode) {
      handleTrackOrder(initialCode);
    }
  }, [initialCode]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    
    const params = new URLSearchParams();
    params.set('code', trackingInput.trim().toUpperCase());
    router.push(`/tracking?${params.toString()}`);

    handleTrackOrder(trackingInput.trim());
  };

  const handleTrackOrder = async (codeOrPhone: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSearched(true);
    setOrder(null);

    const term = codeOrPhone.trim().toUpperCase();

    try {
      let query = supabase.from('orders').select('*');

      if (term.startsWith('FP-') || term.startsWith('MM-')) {
        query = query.eq('tracking_code', term);
      } else {
        const cleanPhone = term.replace(/[\s-+]/g, '');
        query = query.eq('phone', cleanPhone);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        const sorted = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrder(sorted[0]);
      } else {
        setErrorMsg('We could not find any order with this code or phone number. / کوئی آرڈر نہیں ملا۔');
      }
    } catch (e: any) {
      console.error('Error tracking order:', e);
      setErrorMsg('Server connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Dispatched': return 1;
      case 'Delivered': return 2;
      default: return 0;
    }
  };

  const timelineSteps = [
    { title: 'Order Confirmed', desc: 'Order received. Kitchen has started preparation.', icon: Clock },
    { title: 'Baking & Packing', desc: 'Food is in the oven, cooking to perfection.', icon: Flame },
    { title: 'Out for Delivery', desc: 'Fresh & hot food is on its way to you.', icon: Truck }
  ];

  return (
    <div className="container" style={{ padding: '60px 24px 100px 24px', maxWidth: '900px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Track Your Order / آرڈر ٹریکنگ
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Get live updates on your pizza preparation and delivery status
        </p>
      </div>

      {/* Input box */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '30px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '40px'
      }}>
        <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '12px' }} className="hero-search-box">
          <div className="search-input-wrapper">
            <Search size={22} color="var(--primary)" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Enter your Tracking Code (e.g. FP-ABC123) or Mobile Number..."
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '12px 28px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, borderRadius: 'var(--radius-sm)' }}>
            Track Now
          </button>
        </form>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '12px', textAlign: 'center' }}>
          *Note: Enter phone number without country code (e.g., 03001234567).
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>Tracking Order...</p>
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          color: 'var(--status-cancelled)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <HelpCircle size={40} style={{ margin: '0 auto 12px auto' }} />
          <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{errorMsg}</p>
        </div>
      )}

      {/* Track Results Display */}
      {!isLoading && order && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Status timeline */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>TRACKING REF:</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>{order.tracking_code}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>STATUS:</span><br />
                <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
            </div>

            {order.status === 'Cancelled' ? (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--status-cancelled)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <HelpCircle size={28} />
                <div>
                  <h4 style={{ fontWeight: 800 }}>Order Cancelled</h4>
                  <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>This order has been cancelled. Please contact helpline for details.</p>
                </div>
              </div>
            ) : (
              /* Timeline */
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
                marginTop: '40px'
              }} className="timeline-horizontal">
                
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  left: '50px',
                  right: '50px',
                  height: '4px',
                  background: 'var(--border-color)',
                  zIndex: 1
                }}>
                  <div style={{
                    height: '100%',
                    width: `${getStatusIndex(order.status) * 50}%`,
                    background: 'var(--primary)',
                    transition: 'var(--transition)'
                  }}></div>
                </div>

                {timelineSteps.map((step, idx) => {
                  const statusIdx = getStatusIndex(order.status);
                  const isCompleted = idx <= statusIdx;
                  const isActive = idx === statusIdx;
                  const Icon = step.icon;

                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 2,
                      width: '120px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: isCompleted ? 'var(--primary)' : 'var(--card-bg)',
                        border: `3px solid ${isCompleted ? 'var(--primary)' : 'var(--border-color)'}`,
                        color: isCompleted ? 'white' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isActive ? '0 0 0 6px rgba(243, 93, 37, 0.15)' : 'none',
                        transition: 'var(--transition)'
                      }}>
                        <Icon size={22} />
                      </div>
                      <h4 style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 800, 
                        marginTop: '12px',
                        color: isCompleted ? 'var(--foreground)' : 'var(--text-muted)'
                      }}>{step.title}</h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* panels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '30px'
          }} className="tracking-panels-grid">
            
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '30px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                Delivery Summary / ڈلیوری की تفصیل
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Customer Address:</span><br />
                    <strong style={{ color: 'var(--foreground)' }}>{order.customer_name}</strong><br />
                    <span>{order.address}, {order.city}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Phone size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Contact Number:</span><br />
                    <strong>{order.phone}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '30px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                Bill Payment / ادائیگی
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.name} x{item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>Rs. {item.price_pkr * item.quantity}</span>
                  </div>
                ))}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '12px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: 800 }}>COD Amount Payable:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Rs. {order.grand_total}</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Initial state */}
      {!searched && (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <ClipboardList size={40} style={{ color: 'var(--primary)', margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Checking Order Status?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            Enter the tracking code (e.g. FP-ABCDEF) from your confirmation receipt, or enter your registered mobile number to search for your latest order.
          </p>
        </div>
      )}

      <style jsx global>{`
        @keyframes skeleton-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, var(--border-color) 25%, var(--background) 37%, var(--border-color) 63%);
          background-size: 400% 100%;
          animation: skeleton-shimmer 1.4s ease infinite;
          border-radius: 4px;
          display: block;
        }
        @media (max-width: 768px) {
          .timeline-horizontal {
            flex-direction: column !important;
            gap: 24px !important;
            align-items: flex-start !important;
          }
          .timeline-horizontal > div {
            flex-direction: row !important;
            text-align: left !important;
            width: 100% !important;
            gap: 16px !important;
          }
          .timeline-horizontal > div > p {
            text-align: left !important;
          }
          .timeline-horizontal > div > h4 {
            margin-top: 0 !important;
          }
          .timeline-horizontal > div:first-child {
            display: none !important;
          }
          .tracking-panels-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <p>Tracking Engine Loading...</p>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
