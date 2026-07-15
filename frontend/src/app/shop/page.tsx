'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Plus, Check, ShoppingCart, HelpCircle, Star, History, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { PizzaItem } from '@/lib/supabaseClient';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export interface Offer {
  id: number;
  title: string;
  description: string;
  discount_text: string;
  price_pkr?: number;
  badge: string;
  image_url: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  // URL Param states
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [menuItems, setMenuItems] = useState<PizzaItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const { addToCart } = useCart();

  const categories = [
    'All', 'Pizza', 'Burger', 'Sandwich', 'Pasta', 'Sides'
  ];

  // Update states if URL query changes
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fatpizza_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Debounced Live Search implementation
  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || '';
    if (search !== currentUrlSearch) {
      setIsDebouncing(true);
      const handler = setTimeout(() => {
        updateUrlParams(search, selectedCategory);
        setIsDebouncing(false);
      }, 400); // 400ms delay before triggering search
      
      return () => clearTimeout(handler);
    } else {
      setIsDebouncing(false);
    }
  }, [search, selectedCategory, searchParams]);

  // Query database based on search query and category
  useEffect(() => {
    async function filterItems() {
      setIsLoading(true);
      try {
        let query = supabase.from('medicines').select('*');

        if (selectedCategory && selectedCategory !== 'All') {
          query = query.eq('category', selectedCategory);
        }

        const searchQuery = searchParams.get('search') || '';
        if (searchQuery.trim()) {
          query = query.or(`name.ilike.%${searchQuery}%,generic_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
        }

        const { data } = await query.order('name', { ascending: true });
        
        if (data) {
          setMenuItems(data);
        }

        // Fetch Offers if no specific category is selected (or if we want them always)
        if (!selectedCategory || selectedCategory === 'All') {
          try {
            const res = await fetch('/api/offers');
            const offersData = await res.json();
            if (offersData?.success) {
              setOffers(offersData.offers.filter((o: Offer) => o.is_active));
            }
          } catch (e) {
            console.error('Error fetching offers', e);
          }
        } else {
          setOffers([]); // Clear offers when filtering by category
        }
      } catch (e) {
        console.error('Error fetching menu catalog:', e);
      } finally {
        setIsLoading(false);
      }
    }

    filterItems();
  }, [selectedCategory, searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const current = [...recentSearches];
    const filtered = current.filter(s => s.toLowerCase() !== query.trim().toLowerCase());
    const updated = [query.trim(), ...filtered].slice(0, 5); // Keep latest 5
    setRecentSearches(updated);
    localStorage.setItem('fatpizza_recent_searches', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(search, selectedCategory);
    saveRecentSearch(search);
    setIsSearchFocused(false);
  };

  const handleCategorySelect = (cat: string) => {
    const nextCat = cat === 'All' ? '' : cat;
    setSelectedCategory(nextCat);
    updateUrlParams(search, nextCat);
  };

  const updateUrlParams = (searchText: string, categoryText: string) => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('search', searchText.trim());
    if (categoryText) params.set('category', categoryText);
    router.push(`/shop?${params.toString()}`);
  };

  const handleAddToCart = (e: React.MouseEvent, item: PizzaItem) => {
    e.stopPropagation();
    addToCart(item as any, 1);
    setShowNotification(item.name);
    setTimeout(() => {
      setShowNotification(null);
    }, 2500);
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      
      {/* Header and statistics */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          {t('Fatpizza Menu', 'فیٹ پیزا مینو')}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isLoading ? t('Searching Menu...', 'مینو تلاش کیا جا رہا ہے...') : t(`Found ${menuItems.length} delicious items ready to order`, `آرڈر کرنے کے لیے ${menuItems.length} مزیدار چیزیں ملیں`)}
        </p>
      </div>

      {/* Main Grid: Sidebar filter and product listing */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '40px',
        alignItems: 'start'
      }} className="shop-layout">
        
        {/* Sidebar Filters */}
        <aside style={{
          position: 'sticky',
          top: '110px',
          background: 'var(--card-bg)',
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <SlidersHorizontal size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{t('Categories', 'اقسام')}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map((cat, index) => {
              const isActive = (cat === 'All' && !selectedCategory) || (selectedCategory === cat);
              return (
                <button
                  key={index}
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    background: isActive ? 'var(--primary-bg)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  className="category-filter-btn"
                >
                  <span>{t(cat === 'All' ? 'All Items' : `${cat}s`, cat === 'All' ? 'تمام کھانے' : cat === 'Pizza' ? 'پیزا' : cat === 'Burger' ? 'برگر' : cat === 'Sandwich' ? 'سینڈوچ' : cat === 'Pasta' ? 'پاستا' : cat === 'Sides' ? 'سائیڈز' : cat)}</span>
                  {isActive && <span style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}></span>}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ 
              background: 'var(--primary-bg)', 
              color: 'var(--primary)', 
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              lineHeight: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontWeight: 900 }}>🔥 {t('Chef Tip:', 'باورچی کا مشورہ:')}</span>
              <span>{t('Our pizzas are baked fresh in a traditional wood-fired brick oven. Customize toppings at checkout!', 'ہمارے پیزا روایتی لکڑی کے تندور میں تازہ پکے ہوئے ہیں۔ چیک آؤٹ پر اپنی پسند کے مطابق تبدیل کریں!')}</span>
            </div>
          </div>
        </aside>

        {/* Product Catalog view */}
        <section>
          {/* Top Search bar with Professional UX */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '32px', position: 'relative' }} className="hero-search-box">
            <div className="search-input-wrapper">
              <Search size={22} color="var(--text-muted)" />
              <input 
                type="text" 
                className="search-input" 
                placeholder={t("Search for pizza, burger, pasta, toppings...", "پیزا، برگر، پاستا یا ٹوپنگز تلاش کریں...")}
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }}
              />
              
              {/* Dynamic Loading/Clear Icons */}
              {isDebouncing ? (
                <Loader2 size={18} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
              ) : search ? (
                <X 
                  size={18} 
                  color="var(--text-muted)" 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => { setSearch(''); updateUrlParams('', selectedCategory); }} 
                />
              ) : null}
            </div>
            <button type="submit" className="btn-primary" style={{ borderRadius: 'var(--radius-sm)' }}>
              {t('Search', 'تلاش کریں')}
            </button>

            {/* Autocomplete & Recent Searches Dropdown */}
            {isSearchFocused && (recentSearches.length > 0 || !search) && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 100,
                padding: '12px 0',
                overflow: 'hidden'
              }}>
                {recentSearches.length > 0 && (
                  <div style={{ padding: '0 16px 8px 16px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {t('Recent Searches', 'حالیہ تلاش')}
                  </div>
                )}
                
                {recentSearches.map((term, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setSearch(term);
                      updateUrlParams(term, selectedCategory);
                      saveRecentSearch(term);
                    }}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <History size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--foreground)' }}>{term}</span>
                  </div>
                ))}

                {recentSearches.length === 0 && !search && (
                   <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                     <Search size={32} color="var(--border-color)" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                     {t('Try searching for "Zinger" or "Pizza"', '"زنگر" یا "پیزا" تلاش کرنے کی کوشش کریں')}
                   </div>
                )}
              </div>
            )}
          </form>

          {/* Catalog grid rendering */}
          {isLoading ? (
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="product-card" style={{ height: '300px' }}>
                  <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }} />
                </div>
              ))}
            </div>
          ) : menuItems.length === 0 && offers.length === 0 ? (
            <div style={{ 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <HelpCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>{t('No Food Items Found', 'کوئی مینو آئٹم نہیں ملا')}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                {t("We couldn't find anything matching your search. Try adjusting filters or typing another name.", "ہمیں آپ کی تلاش کے مطابق کچھ نہیں ملا۔ فلٹرز کو تبدیل کریں یا کوئی دوسرا نام لکھیں۔")}
              </p>
              <button 
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  updateUrlParams('', '');
                }}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                {t('Clear Filters', 'فلٹرز ری سیٹ کریں')}
              </button>
            </div>
          ) : (
            <div>
              {/* Offers Section */}
              {offers.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{ 
                    fontSize: '2rem', 
                    fontWeight: 900, 
                    marginBottom: '20px', 
                    borderBottom: '3px solid var(--primary)', 
                    display: 'inline-block', 
                    paddingBottom: '8px' 
                  }}>
                    {t('Special Offers', 'خاص آفرز')}
                  </h2>
                  <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {offers.map((offer) => (
                      <div 
                        key={`offer-${offer.id}`} 
                        className="product-card" 
                        style={{ 
                          cursor: 'pointer', 
                          background: 'var(--card-bg)', 
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          overflow: 'hidden'
                        }}
                        onClick={() => router.push(`/offers/${offer.id}`)}
                      >
                        <div className="product-img-wrap" style={{ height: '200px', padding: '0', display: 'block', position: 'relative' }}>
                          <img 
                            src={offer.image_url} 
                            alt={offer.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        
                        <div className="product-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                          <h3 className="product-name" style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase' }}>{offer.title}</h3>
                          
                          {offer.price_pkr ? (
                            <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '12px', color: 'var(--foreground)' }}>
                              PKR {offer.price_pkr}.00
                            </div>
                          ) : (
                            <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '12px', color: 'var(--primary)' }}>
                              View Details
                            </div>
                          )}

                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5, flexGrow: 1 }}>
                            {offer.discount_text || offer.description}
                          </p>
                          
                          <button 
                            className="btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Will handle add to cart from detail page or directly here
                              router.push(`/offers/${offer.id}`);
                            }}
                            style={{ 
                              width: '100%', 
                              padding: '12px', 
                              background: 'var(--primary)', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 800,
                              fontSize: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              marginTop: 'auto'
                            }}
                          >
                            <span style={{ 
                              background: 'white', 
                              color: 'var(--primary)', 
                              borderRadius: '50%', 
                              width: '20px', 
                              height: '20px', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              <Plus size={14} strokeWidth={3} />
                            </span>
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Menu Items Section */}
              {menuItems.length > 0 && (
                <div>
                  <h2 style={{ 
                    fontSize: '2rem', 
                    fontWeight: 900, 
                    marginBottom: '20px', 
                    display: offers.length > 0 ? 'block' : 'none' 
                  }}>
                    {t('Menu', 'مینو')}
                  </h2>
                  <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {/* Render Regular Menu Items */}
              {menuItems.map((item) => (
                <div 
                  key={item.id} 
                  className="product-card tape-sticker" 
                  style={{ cursor: 'pointer', background: 'var(--card-bg)' }}
                  onClick={() => router.push(`/product/${item.id}`)}
                >
                  <div className="product-img-wrap" style={{ height: '180px', padding: '0', display: 'block', position: 'relative' }}>
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  
                  <div className="product-content" style={{ padding: '16px' }}>
                    <span className="product-category" style={{ fontSize: '0.7rem' }}>{t(item.category, item.category === 'Pizza' ? 'پیزا' : item.category === 'Burger' ? 'برگر' : item.category === 'Sandwich' ? 'سینڈوچ' : item.category === 'Pasta' ? 'پاستا' : item.category === 'Sides' ? 'سائیڈز' : item.category)}</span>
                    <h3 className="product-name" style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t(item.name)}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', minHeight: '38px', lineBreak: 'anywhere' }}>
                      {t(item.generic_name)}
                    </p>
                    <span className="product-dosage" style={{ fontSize: '0.75rem', padding: '2px 8px', marginBottom: '12px' }}>{t(item.dosage)}</span>
                    
                    <div className="product-footer">
                      <div className="product-price">
                        <span className="price-val" style={{ fontSize: '1.2rem', fontWeight: 900 }}>Rs. {item.price_pkr}</span>
                      </div>
                      <button 
                        className="btn-icon-add" 
                        onClick={(e) => handleAddToCart(e, item)}
                        title="Add to Cart"
                        style={{ width: '36px', height: '36px', background: 'var(--primary)', color: 'white', borderRadius: '50%' }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
                </div>
              </div>
              )}
            </div>
          )}
        </section>
      </div>

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
          <span>{t(`Added **${t(showNotification)}** to cart`, `**${t(showNotification)}** کارٹ میں شامل کر دیا گیا!`)}</span>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 900px) {
          .shop-layout {
            grid-template-columns: 1fr !important;
          }
          aside {
            position: relative !important;
            top: 0 !important;
            margin-bottom: 24px;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function ShopPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <p style={{ marginTop: '16px' }}>{t('Menu Loading...', 'مینو لوڈ ہو رہا ہے...')}</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
