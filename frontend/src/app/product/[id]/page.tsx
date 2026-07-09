'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, ShieldCheck, Check, Truck, Flame, PackageOpen, Award } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { PizzaItem } from '@/lib/supabaseClient';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = params.id as string;
  const id = parseInt(idStr, 10);
  const { t } = useLanguage();

  const [item, setItem] = useState<PizzaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      if (isNaN(id)) return;
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('medicines')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          setItem(data);
        }
      } catch (e) {
        console.error('Error fetching food details:', e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (item) {
      addToCart(item as any, quantity);
      setShowAddedToast(true);
      setTimeout(() => setShowAddedToast(false), 2500);
    }
  };

  const increaseQty = () => setQuantity(q => q + 1);
  const decreaseQty = () => setQuantity(q => q > 1 ? q - 1 : 1);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
        <div className="skeleton-shimmer" style={{ width: '120px', height: '20px', marginBottom: '32px' }} />
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr'
        }} className="product-detail-grid">
          <div style={{ background: 'transparent', height: '400px' }} className="product-detail-img-wrap">
            <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }} />
          </div>
          <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton-shimmer" style={{ width: '30%', height: '16px' }} />
            <div className="skeleton-shimmer" style={{ width: '70%', height: '36px' }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: '100px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>{t('Food Item Not Found', 'کھانے کی چیز نہیں ملی')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{t("We couldn't find the menu item you are looking for.", 'ہمیں وہ مینو آئٹم نہیں مل سکا جس کی آپ تلاش کر رہے ہیں۔')}</p>
        <button className="btn-primary" onClick={() => router.push('/shop')}>
          {t('Back to Menu', 'مینو پر واپس جائیں')}
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      
      {/* Back button */}
      <button 
        onClick={() => router.back()} 
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          fontWeight: 800,
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
        <ArrowLeft size={18} /> {t('Back', 'واپس جائیں')}
      </button>

      {/* Main product details */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr'
      }} className="product-detail-grid">
        
        {/* Left Column: Image */}
        <div style={{
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          borderRight: '1px solid var(--border-color)'
        }} className="product-detail-img-wrap">
          <img 
            src={item.image_url} 
            alt={item.name} 
            style={{
              width: '100%',
              maxHeight: '380px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)'
            }}
          />
        </div>

        {/* Right Column: Menu item descriptions and purchase panel */}
        <div style={{ padding: '50px' }} className="product-detail-body">
          {/* Category */}
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 900,
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
            display: 'inline-block'
          }}>{t(item.category, item.category === 'Pizza' ? 'پیزا' : item.category === 'Burger' ? 'برگر' : item.category === 'Sandwich' ? 'سینڈوچ' : item.category === 'Pasta' ? 'پاستا' : item.category === 'Sides' ? 'سائیڈز' : item.category)}</span>

          {/* Name */}
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--foreground)', marginBottom: '4px', lineHeight: 1.2 }}>
            {t(item.name)}
          </h1>

          {/* Ingredients / toppings list */}
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            ✨ <strong style={{ color: 'var(--foreground)' }}>{t('Ingredients:', 'اجزاء:')}</strong> {t(item.generic_name)}
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              background: 'var(--primary-bg)',
              color: 'var(--primary)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)'
            }}>{t(item.dosage)}</span>

            <span style={{
              fontSize: '0.8' + 'rem',
              fontWeight: 700,
              color: 'var(--status-delivered)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🔥 {t('Freshly Baked', 'تازہ پکا ہوا')}
            </span>
          </div>

          {/* Price panel */}
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{t('Price', 'قیمت')}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--foreground)' }}>Rs. {item.price_pkr}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={16} fill="currentColor" color="white" /> {t('100% Quality Guaranteed', '100% معیار کی ضمانت')}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px' }}>{t('Description:', 'تفصیل:')}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
              {t(item.description)}
            </p>
          </div>

          {/* Specifications */}
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
              <strong>{t('Kitchen:', 'کچن:')}</strong><br />
              <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{t(item.manufacturer, item.manufacturer === 'Fatpizza Kitchen' ? 'فیٹ پیزا کچن' : item.manufacturer)}</span>
            </div>
            <div>
              <strong>{t('Type:', 'قسم:')}</strong><br />
              <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{t(item.category, item.category === 'Pizza' ? 'پیزا' : item.category === 'Burger' ? 'برگر' : item.category === 'Sandwich' ? 'سینڈوچ' : item.category === 'Pasta' ? 'پاستا' : item.category === 'Sides' ? 'سائیڈز' : item.category)}</span>
            </div>
          </div>

          {/* Quantity selector and Add to Cart action */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                  fontWeight: 900,
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
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  color: 'var(--foreground)'
                }}
              >+</button>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleAddToCart}
              style={{ flex: 1, padding: '16px 24px', justifyContent: 'center', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ShoppingBag size={20} /> {t('Add to Cart', 'کارٹ میں ڈالیں')}
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
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{t('30-Minute Free Delivery Guarantee', '30 منٹ میں مفت ڈلیوری کی ضمانت')}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t("Hot & fresh to DHA, Gulberg, and F-7. If late, it's 100% free!", 'ڈی ایچ اے، گلبرگ، اور ایف 7 میں گرما گرم اور تازہ۔ اگر دیر ہوئی تو 100٪ مفت!')}</p>
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
          <Award size={24} color="var(--primary)" />
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{t('Hygiene Certified Kitchen', 'حفظان صحت سے تصدیق شدہ کچن')}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('Our kitchens are double-sanitized daily and bake food at 400°C.', 'ہمارے کچن روزانہ دو بار صاف کیے جاتے ہیں اور کھانا 400 ڈگری سینٹی گریڈ پر پکایا جاتا ہے۔')}</p>
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
          background: 'var(--accent)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.9rem',
          fontWeight: 800,
          border: '1px solid var(--primary)',
          animation: 'slideUp 0.25s'
        }}>
          <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '4px' }}>
            <Check size={14} />
          </div>
          <span>{t(`Added **${quantity}x ${item.name}** to your cart!`, `کارٹ میں **${quantity}x ${item.name}** شامل کر دیا گیا!`)}</span>
        </div>
      )}
    </div>
  );
}
