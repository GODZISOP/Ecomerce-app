'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Check, Plus, Star, ShieldCheck, Heart, User, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { PizzaItem } from '@/lib/supabaseClient';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredItems, setFeaturedItems] = useState<PizzaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchFeatured() {
      setIsLoading(true);
      try {
        // Fetch pizzas, burgers, and pasta for home screen display
        const { data } = await supabase
          .from('medicines')
          .select('*')
          .in('id', [1, 2, 4, 12, 13, 14, 15, 17, 20]); // Veggie, Cheese, Supreme, Kabab Chaska, Zinger, Creamy Pizza, Pepperoni, Beef Burger, Pasta
          
        if (data) {
          setFeaturedItems(data);
        }
      } catch (e) {
        console.error('Error fetching featured menu:', e);
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

  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    addToCart(item, 1);
    setShowNotification(item.name);
    setTimeout(() => {
      setShowNotification(null);
    }, 2500);
  };

  const categories = [
    { name: 'Pizza', emoji: '🍕' },
    { name: 'Burger', emoji: '🍔' },
    { name: 'Sandwich', emoji: '🥪' },
    { name: 'Pasta', emoji: '🍝' },
    { name: 'Sides', emoji: '🍟' }
  ];

  const chefs = [
    { name: "Sarlout Rhinoa", role: "Master Pizzaiolo", img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&q=80" },
    { name: "Dumiri Incelo", role: "Sous Chef", img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&q=80" },
    { name: "Harih Kulguse", role: "Burger Specialist", img: "https://images.unsplash.com/photo-1595273670150-db0d3bf3cab2?w=150&q=80" },
    { name: "Chualin Curupuso", role: "Pasta Master", img: "https://images.unsplash.com/photo-1622023459113-9b195477c9c4?w=150&q=80" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '60px' }}>
      
      {/* 1. Hero Section - Matching Reference Layout */}
      <section style={{
        background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        borderBottom: '8px solid var(--primary)',
        textAlign: 'center'
      }} className="hero">
        <div className="container" style={{ maxWidth: '800px' }}>
          <span style={{
            background: 'var(--primary)',
            color: 'white',
            fontWeight: 800,
            fontSize: '0.85rem',
            padding: '8px 18px',
            borderRadius: 'var(--radius-pill)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            display: 'inline-block',
            marginBottom: '24px'
          }}>
            {t('Welcome to Fatpizza', 'فیٹ پیزا میں خوش آمدید')}
          </span>
          
          <h1 className="hero-title" style={{
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '20px',
            fontFamily: 'var(--font-display)',
            textShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            {t("It's Not Just A Pizza,", 'یہ صرف پیزا نہیں ہے،')}<br />
            <span style={{ color: 'var(--primary)' }}>{t('An Experience.', 'ایک یادگار تجربہ ہے۔')}</span>
          </h1>
          
          <p className="hero-desc" style={{
            color: '#f4f1ea',
            lineHeight: 1.6,
            textShadow: '0 2px 6px rgba(0,0,0,0.5)',
            margin: '0 auto 40px auto'
          }}>
            {t('Handcrafted with passion, baked to perfection in a wood-fired brick oven, and delivered hot to your doorstep with a touch of culinary art.', 'محبت سے تیار کردہ، لکڑی کے تندور میں پکایا ہوا، اور فنی نفاست کے ساتھ گرما گرم آپ کی دہلیز پر پہنچایا گیا۔')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', fontWeight: 800, borderRadius: 'var(--radius-pill)', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
              {t('View Our Menu', 'ہمارا مینو دیکھیں')}
            </Link>
            <Link href="/tracking" style={{ padding: '16px 36px', fontSize: '1.05rem', fontWeight: 800, borderRadius: 'var(--radius-pill)', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '2px solid white', color: 'white', cursor: 'pointer', textDecoration: 'none', transition: 'var(--transition)' }}>
              {t('Track Live Order', 'آرڈر ٹریک کریں')}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Discover Our Menu & Category Filter */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-display)' }}>{t('Discover Our Menu', 'ہمارا مینو دریافت کریں')}</h2>
          <p className="section-subtitle">{t('Taste the goodness of handcrafted gourmet specialties', 'ہمارے ہاتھ سے تیار کردہ خاص کھانوں کا ذائقہ چکھیں')}</p>
          <div style={{ width: '60px', height: '4px', background: 'var(--primary)', margin: '16px auto 0 auto', borderRadius: '2px' }} />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <Link href="/shop" className="category-pill" style={{ textDecoration: 'none' }}>
            <span>🍽️</span>
            <span>{t('All Menu Items', 'تمام آئٹمز')}</span>
          </Link>
          {categories.map((cat, idx) => (
            <Link key={idx} href={`/shop?category=${cat.name}`} className="category-pill" style={{ textDecoration: 'none' }}>
              <span>{cat.emoji}</span>
              <span>{t(`${cat.name}s`, `${cat.name === 'Sides' ? 'سائیڈز' : cat.name === 'Pizza' ? 'پیزا' : cat.name === 'Burger' ? 'برگر' : cat.name === 'Pasta' ? 'پاستا' : cat.name === 'Sandwich' ? 'سینڈوچ' : cat.name}`)}</span>
            </Link>
          ))}
        </div>

        {/* Menu Cards List with tape sticker */}
        {isLoading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="product-card" style={{ height: '320px' }}>
                <div className="skeleton-shimmer" style={{ width: '100%', height: '180px' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {featuredItems.map((item) => (
              <div 
                key={item.id} 
                className="product-card tape-sticker" 
                style={{ cursor: 'pointer', background: 'var(--card-bg)' }}
                onClick={() => router.push(`/product/${item.id}`)}
              >
                <div className="product-img-wrap" style={{ background: '#fcfcfc', borderBottom: '1px solid var(--border-color)', height: '220px', padding: '0', display: 'block', position: 'relative' }}>
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', color: 'white', fontSize: '0.8rem', fontWeight: 800, padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}>
                    Rs. {item.price_pkr}
                  </div>
                </div>

                <div className="product-content" style={{ padding: '20px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t(item.category, item.category === 'Pizza' ? 'پیزا' : item.category === 'Burger' ? 'برگر' : item.category === 'Sandwich' ? 'سینڈوچ' : item.category === 'Pasta' ? 'پاستا' : item.category === 'Sides' ? 'سائیڈز' : item.category)}</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px', color: 'var(--foreground)' }}>{t(item.name)}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', minHeight: '38px', lineBreak: 'anywhere' }}>
                    {t(item.generic_name)}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: '4px' }}>5.0</span>
                  </div>

                  <div className="product-footer" style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t(item.dosage)}</span>
                    <button 
                      className="btn-icon-add" 
                      onClick={(e) => handleAddToCart(e, item)}
                      style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%' }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Ways To Enjoy Section (Matching Reference layout) */}
      <section className="container">
        <div className="hero-grid" style={{ alignItems: 'center', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          {/* Orange promo banner left */}
          <div style={{
            background: 'linear-gradient(135deg, #f35d25 0%, #ff8c42 100%)',
            padding: '50px 30px', // slightly less padding for mobile
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '350px',
            position: 'relative'
          }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
              {t('30 minutes, or pizza for free.', '30 منٹ میں ڈلیوری، ورنہ پیزا مفت۔')}
            </h2>
            <p style={{ fontSize: '1rem', color: '#fff0e6', marginBottom: '30px', maxWidth: '380px' }}>
              {t('We guarantee hot, fresh pizzas delivered to your door within half an hour, or your order is completely free of charge!', 'ہم آدھے گھنٹے کے اندر آپ کے دروازے پر گرم اور تازہ پیزا پہنچانے کی ضمانت دیتے ہیں، ورنہ آپ کا آرڈر بالکل مفت ہوگا!')}
            </p>
            
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px 18px', borderRadius: 'var(--radius-md)' }}>
                🛵 <strong>{t('Fast Delivery', 'تیز ترین ڈلیوری')}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px 18px', borderRadius: 'var(--radius-md)' }}>
                🍕 <strong>{t('Hot & Fresh', 'گرم اور تازہ')}</strong>
              </div>
            </div>
          </div>

          {/* Story / Ways to enjoy details right */}
          <div style={{ padding: '50px', color: '#111111' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px', color: '#111111' }}>{t('This Is Our Story', 'یہ ہے ہماری کہانی')}</h3>
            <p style={{ color: '#333333', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {t('Fatpizza started as a small brick oven kitchen in DHA. Our secret has always been simple: imported San Marzano tomato sauce, fresh hand-pulled local mozzarella, and a signature crust fermented for 48 hours. Today, we still bake every single pizza to order with love.', 'فیٹ پیزا کا آغاز ڈی ایچ اے میں ایک چھوٹے سے تندوری کچن سے ہوا تھا۔ ہمارا راز ہمیشہ سادہ رہا ہے: بہترین ٹماٹر کی چٹنی، تازہ مقامی پنیر، اور 48 گھنٹے تک خمیر کیا ہوا خاص خمیرہ۔ آج بھی ہم ہر پیزا کو محبت سے آرڈر پر ہی تیار کرتے ہیں۔')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '16px', textAlign: 'center', marginTop: '20px' }}>
              <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '6px', color: '#111111' }}>{t('Pick up', 'خود لے جائیں')}</div>
              </div>
              <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '1.5rem' }}>🍽️</span>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '6px', color: '#111111' }}>{t('Dine-in', 'وہیں کھائیں')}</div>
              </div>
              <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '1.5rem' }}>🚚</span>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '6px', color: '#111111' }}>{t('Catering', 'کیٹرنگ')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Chefs Section */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-display)' }}>{t('Meet Our Great Chefs', 'ہمارے ماہر شیف سے ملیں')}</h2>
          <p className="section-subtitle">{t('The culinary artists crafting your experience', 'آپ کے ذائقے کو سجانے والے ہمارے فنکار')}</p>
          <div style={{ width: '60px', height: '4px', background: 'var(--primary)', margin: '16px auto 0 auto', borderRadius: '2px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
          {chefs.map((chef, idx) => (
            <div key={idx} className="product-card tape-sticker" style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--card-bg)' }}>
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px auto', border: '4px solid var(--border-color)' }}>
                <img src={chef.img} alt={chef.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{chef.name}</h4>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginTop: '4px' }}>{t(chef.role, chef.role === 'Master Pizzaiolo' ? 'ماہر پیزا میکر' : chef.role === 'Sous Chef' ? 'نائب شیف' : chef.role === 'Burger Specialist' ? 'برگر کے ماہر' : chef.role === 'Pasta Master' ? 'پاستا کے ماہر' : chef.role)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Toast Notification */}
      {showNotification && (
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
          <span>{t(`Added **${showNotification}** to cart`, `**${showNotification}** کارٹ میں شامل کر دیا گیا!`)}</span>
        </div>
      )}

      {/* Floating Bottom Left Specials Widget */}
      <Link href="/shop" style={{
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        zIndex: 999,
        background: 'var(--primary)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: 'var(--radius-pill)',
        boxShadow: '0 8px 24px rgba(243, 93, 37, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: 800,
        fontSize: '0.85rem',
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer'
      }}>
        <Flame size={16} fill="white" />
        <span>{t('Build Your Pizza!', 'اپنا پیزا بنائیں!')}</span>
      </Link>

    </div>
  );
}
