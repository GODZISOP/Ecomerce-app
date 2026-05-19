'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, ShieldAlert, BadgeCheck, Clipboard, Package, Truck, Check, HeartPulse } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Medicine, useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = params.id as string;
  const id = parseInt(idStr, 10);

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      if (isNaN(id)) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('medicines')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          setMedicine(data);
        } else {
          console.error(error);
        }
      } catch (e) {
        console.error('Error fetching medicine details:', e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (medicine) {
      addToCart(medicine, quantity);
      setShowAddedToast(true);
      setTimeout(() => setShowAddedToast(false), 2500);
    }
  };

  const increaseQty = () => setQuantity(q => q + 1);
  const decreaseQty = () => setQuantity(q => q > 1 ? q - 1 : 1);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
        {/* Back button skeleton */}
        <div className="skeleton-shimmer" style={{ width: '120px', height: '20px', marginBottom: '32px' }} />

        {/* Two column grid skeleton */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr'
        }} className="product-detail-grid">
          
          {/* Left Column: Image skeleton */}
          <div style={{
            background: '#fcfefe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            borderRight: '1px solid var(--border-color)',
            height: '450px'
          }} className="product-detail-img-wrap">
            <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Right Column: Details skeleton */}
          <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="product-detail-body">
            <div className="skeleton-shimmer" style={{ width: '20%', height: '14px' }} />
            <div className="skeleton-shimmer" style={{ width: '65%', height: '36px', margin: '8px 0' }} />
            <div className="skeleton-shimmer" style={{ width: '45%', height: '20px' }} />
            
            <div style={{ display: 'flex', gap: '12px', margin: '8px 0' }}>
              <div className="skeleton-shimmer" style={{ width: '70px', height: '24px' }} />
              <div className="skeleton-shimmer" style={{ width: '120px', height: '24px' }} />
            </div>

            <div className="skeleton-shimmer" style={{ width: '100%', height: '60px', margin: '8px 0', borderRadius: 'var(--radius-md)' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
              <div className="skeleton-shimmer" style={{ width: '30%', height: '16px' }} />
              <div className="skeleton-shimmer" style={{ width: '100%', height: '16px' }} />
              <div className="skeleton-shimmer" style={{ width: '90%', height: '16px' }} />
              <div className="skeleton-shimmer" style={{ width: '40%', height: '16px' }} />
            </div>

            <div className="skeleton-shimmer" style={{ width: '100%', height: '50px', marginTop: '16px', borderRadius: 'var(--radius-md)' }} />

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div className="skeleton-shimmer" style={{ width: '120px', height: '48px', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton-shimmer" style={{ flex: 1, height: '48px', borderRadius: 'var(--radius-sm)' }} />
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Dawai Nahi Mili / Medicine Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Humare paas is code ki koi dawa mojood nahi hai.</p>
        <button className="btn-primary" onClick={() => router.push('/shop')}>
          Back to Shop Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      
      {/* Back to Shop indicator */}
      <button 
        onClick={() => router.back()} 
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          marginBottom: '32px',
          transition: 'var(--transition-fast)'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={18} /> Back / واپس جائیں
      </button>

      {/* Main product card detail splitting */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr'
      }} className="product-detail-grid">
        
        {/* Left Column: Image wrapper */}
        <div style={{
          background: '#fcfefe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          borderRight: '1px solid var(--border-color)'
        }} className="product-detail-img-wrap">
          <img 
            src={medicine.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80'} 
            alt={medicine.name} 
            style={{
              maxWidth: '100%',
              maxHeight: '380px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80';
            }}
          />
        </div>

        {/* Right Column: Medical Details and Buy Options */}
        <div style={{ padding: '50px' }} className="product-detail-body">
          {/* Category */}
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
            display: 'inline-block'
          }}>{medicine.category}</span>

          {/* Medicine Name */}
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '4px', lineHeight: 1.2 }}>
            {medicine.name}
          </h1>

          {/* Generic formulation name */}
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px' }}>
            Generic: {medicine.generic_name}
          </p>

          {/* Dosage form */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              background: 'var(--primary-bg)',
              color: 'var(--primary)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)'
            }}>{medicine.dosage}</span>

            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: medicine.stock > 0 ? 'var(--status-delivered)' : 'var(--status-cancelled)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Package size={14} /> {medicine.stock > 0 ? `In Stock (${medicine.stock} units)` : 'Out of Stock'}
            </span>
          </div>

          {/* Warning banner if Rx required */}
          {medicine.requires_prescription && (
            <div className="prescription-warning-banner">
              <ShieldAlert size={28} />
              <div className="warning-desc">
                <span>⚠️ Prescription (Rx) Required / نسخہ لازمی ہے</span>
                <span>Yeh dawa deliver karne se pehle hamara delivery rider doctor ka original prescription check karega.</span>
              </div>
            </div>
          )}

          {/* Price Tag */}
          <div style={{
            background: 'var(--background)',
            padding: '20px 24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>RETAIL PRICE / پرچون قیمت</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--foreground)' }}>Rs. {medicine.price_pkr}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ pack</span>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BadgeCheck size={16} fill="currentColor" color="white" /> 100% Genuine Guaranteed
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px' }}>Description / دوا کی معلومات:</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
              {medicine.description || 'No detailed instructions available for this medical formula. Please consult with a physician or read the leaflet provided inside the medicine package.'}
            </p>
          </div>

          {/* Manufacturer specifications */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px', 
            fontSize: '0.85rem',
            padding: '16px 0',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '36px',
            color: 'var(--text-muted)'
          }}>
            <div>
              <strong>Manufacturer:</strong><br />
              <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{medicine.manufacturer}</span>
            </div>
            <div>
              <strong>Category Type:</strong><br />
              <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{medicine.category}</span>
            </div>
          </div>

          {/* Quantity and Checkout action */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            
            {/* Qty count selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--background)',
              padding: '4px'
            }}>
              <button 
                onClick={decreaseQty}
                style={{
                  width: '36px',
                  height: '36px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: 'var(--foreground)'
                }}
              >-</button>
              <span style={{
                width: '40px',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '1rem'
              }}>{quantity}</span>
              <button 
                onClick={increaseQty}
                style={{
                  width: '36px',
                  height: '36px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: 'var(--foreground)'
                }}
              >+</button>
            </div>

            {/* Purchase action */}
            <button 
              className="btn-primary" 
              onClick={handleAddToCart}
              style={{ flex: 1, padding: '16px 24px', justifyContent: 'center' }}
            >
              <ShoppingBag size={20} /> Add to Basket / کارٹ میں ڈالیں
            </button>
          </div>
          
        </div>
      </div>

      {/* Trust reassurance banner below details */}
      <div style={{
        marginTop: '40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Truck size={24} color="var(--primary)" />
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Same Day Delivery</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orders in Karachi, Lahore, Islamabad delivered in 4-6 hours.</p>
          </div>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Clipboard size={24} color="var(--primary)" />
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Pharmacist Verification</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Every order is verified by a licensed PMDC doctor/pharmacist.</p>
          </div>
        </div>
      </div>

      {/* Added Toast */}
      {showAddedToast && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '30px',
          zIndex: 9999,
          background: 'var(--foreground)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'slideUp 0.25s'
        }}>
          <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '4px' }}>
            <Check size={14} />
          </div>
          <span>Added **{quantity}x {medicine.name}** to your cart!</span>
        </div>
      )}

      {/* Global spinning keyframe */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
