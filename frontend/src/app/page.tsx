'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Activity, ArrowRight, ShieldCheck, HeartPulse, Check, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Medicine, useCart } from '@/context/CartContext';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredMedicines, setFeaturedMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchFeatured() {
      setIsLoading(true);
      try {
        // Fetch a diverse set of 8 popular medicines for the home page
        const { data, error } = await supabase
          .from('medicines')
          .select('*')
          .in('id', [1, 2, 5, 9, 10, 36, 44, 53]); // Panadol, Brufen, Augmentin, Omeprazole, Gaviscon, Zyrtec, Ispaghol, Neurobion
          
        if (data) {
          setFeaturedMedicines(data);
        }
      } catch (e) {
        console.error('Error fetching featured medicines:', e);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, med: Medicine) => {
    e.stopPropagation();
    addToCart(med, 1);
    setShowNotification(med.name);
    setTimeout(() => {
      setShowNotification(null);
    }, 2500);
  };

  const categories = [
    { name: 'Painkiller', emoji: '💊', urdu: 'درد کش' },
    { name: 'Antibiotic', emoji: '🦠', urdu: 'اینٹی بائیوٹک' },
    { name: 'Antacid', emoji: '🧪', urdu: 'تیزابیت' },
    { name: 'Diabetes', emoji: '🍬', urdu: 'شوگر' },
    { name: 'Blood Pressure', emoji: '🩸', urdu: 'بلڈ پریشر' },
    { name: 'Cholesterol', emoji: '🥓', urdu: 'کولیسٹرول' },
    { name: 'Respiratory', emoji: '🫁', urdu: 'دمہ' },
    { name: 'Cough & Cold', emoji: '🤧', urdu: 'کھانسی' },
    { name: 'Allergy', emoji: '🌸', urdu: 'الرجی' },
    { name: 'Vitamins', emoji: '🍊', urdu: 'وٹامنز' },
    { name: 'Skin', emoji: '🧴', urdu: 'جلد' },
    { name: 'Diarrhea', emoji: '💧', urdu: 'دست' },
    { name: 'Constipation', emoji: '🌾', urdu: 'قبض' },
    { name: 'Antifungal', emoji: '🍄', urdu: 'فنگل' },
    { name: 'Thyroid', emoji: '🦋', urdu: 'تھائرائڈ' },
    { name: 'Nausea', emoji: '🤢', urdu: 'الٹی' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
      
      {/* 1. Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-tag">
              <Sparkles size={14} fill="currentColor" /> Authentic Health Solutions for Pakistan
            </div>
            
            <h1 className="hero-title">
              Your Health, Our Priority.<br />
              <span>Authentic Medicines</span> Delivered Home.
            </h1>
            
            <p className="hero-desc">
              MediMart Pakistan offers 100% genuine medical supplies. Consult our AI Pharmacist, search by symptoms, and pay via Cash on Delivery anywhere in Pakistan.
            </p>
            
            {/* Symptom / Name search bar */}
            <form onSubmit={handleSearchSubmit} className="hero-search-box">
              <div className="search-input-wrapper">
                <Search size={22} color="var(--primary)" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Dawai ya symptom likhein (e.g. Panadol, Acidity, Headache, بخار)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary">
                Search / تلاش کریں
              </button>
            </form>

            <div style={{ display: 'flex', gap: '20px', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>**Trending Search:**</span>
              <Link href="/shop?search=Panadol" style={{ textDecoration: 'underline', color: 'var(--primary)', fontWeight: 600 }}>Panadol</Link>
              <Link href="/shop?search=acidity" style={{ textDecoration: 'underline', color: 'var(--primary)', fontWeight: 600 }}>Acidity Relief</Link>
              <Link href="/shop?search=cough" style={{ textDecoration: 'underline', color: 'var(--primary)', fontWeight: 600 }}>Cough Syrup</Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-img-bg"></div>
            <div className="hero-card">
              <div className="hero-card-icon">
                <HeartPulse size={36} />
              </div>
              <h3 className="hero-card-title">AI Pharmacist Active</h3>
              <p className="hero-card-subtitle">Click the chat widget on the bottom right to check symptoms in Roman Urdu!</p>
              <div style={{ 
                marginTop: '16px', 
                background: 'var(--primary-bg)', 
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-block'
              }}>
                💬 Chat Karein / ابھی بات کریں
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Section */}
      <section className="container">
        <div className="section-title-wrap">
          <div>
            <h2 className="section-title">Shop by Category / اقسام</h2>
            <p className="section-subtitle">Dawa ki category muntakhib karein</p>
          </div>
          <Link href="/shop" className="view-all">
            View All Medicines <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="category-scroll-container">
          <div className="category-row">
            {categories.map((cat, index) => (
              <Link key={index} href={`/shop?category=${cat.name}`} className="category-pill">
                <span>{cat.emoji}</span>
                <span className="mixed-label">
                  <span>{cat.name}</span>
                  <span>{cat.urdu}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="container">
        <div className="section-title-wrap">
          <div>
            <h2 className="section-title">Featured Medicines / مقبول دوائیں</h2>
            <p className="section-subtitle">Dawa ka sahi intikhab</p>
          </div>
          <Link href="/shop" className="view-all">
            See Shop Catalog <ChevronRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="product-card" style={{ pointerEvents: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }} />
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="skeleton-shimmer" style={{ width: '35%', height: '12px' }} />
                  <div className="skeleton-shimmer" style={{ width: '80%', height: '20px' }} />
                  <div className="skeleton-shimmer" style={{ width: '60%', height: '14px' }} />
                  <div className="skeleton-shimmer" style={{ width: '45%', height: '12px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                    <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="skeleton-shimmer" style={{ width: '50%', height: '10px' }} />
                      <div className="skeleton-shimmer" style={{ width: '90%', height: '16px' }} />
                    </div>
                    <div className="skeleton-shimmer" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {featuredMedicines.map((med) => (
              <div 
                key={med.id} 
                className="product-card" 
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/product/${med.id}`)}
              >
                {med.requires_prescription && (
                  <span className="badge-prescription">Rx - Required</span>
                )}
                
                <div className="product-img-wrap">
                  <img 
                    src={med.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'} 
                    alt={med.name} 
                    className="product-img" 
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80';
                    }}
                  />
                </div>
                
                <div className="product-content">
                  <span className="product-category">{med.category}</span>
                  <h3 className="product-name">{med.name}</h3>
                  <span className="product-generic">{med.generic_name}</span>
                  <span className="product-dosage">{med.dosage}</span>
                  
                  <div className="product-footer">
                    <div className="product-price">
                      <span className="price-label">Price / قیمت</span>
                      <span className="price-val">Rs. {med.price_pkr}</span>
                    </div>
                    <button 
                      className="btn-icon-add" 
                      onClick={(e) => handleAddToCart(e, med)}
                      title="Add to Cart"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notification Toast */}
      {showNotification && (
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
          <span>Added **{showNotification}** to cart / کارٹ میں شامل کر دیا گیا!</span>
        </div>
      )}

      {/* 4. Steps Section */}
      <section style={{ background: '#ffffff', padding: '80px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="section-title">How to Order / آرڈر کرنے کا طریقہ</h2>
            <p className="section-subtitle" style={{ fontSize: '1rem' }}>Sada aur aasan marhalay</p>
          </div>
          
          <div className="steps-grid">
            <div>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '1.5rem', fontWeight: 800 }}>1</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>Select Medicines / دوا چنیں</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Catalog se dawai dhoondein ya AI chat assistant se symptoms share kar ke select karein.</p>
            </div>
            
            <div>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '1.5rem', fontWeight: 800 }}>2</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>Cart & Checkout / معلومات</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Cart mein dawa check karein aur apna pata, phone number aur shehar (City) darj karein.</p>
            </div>
            
            <div>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '1.5rem', fontWeight: 800 }}>3</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>Cash on Delivery / ادائیگی</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Dawai receive karte waqt paise ada karein (No online payment required).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Spinner global animation */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
      `}</style>

    </div>
  );
}
