'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Plus, Check, Pill, ShoppingCart, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Medicine, useCart } from '@/context/CartContext';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL Param states
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const { addToCart } = useCart();

  const categories = [
    'All', 'Painkiller', 'Antibiotic', 'Antacid', 'Diabetes', 'Blood Pressure', 
    'Cholesterol', 'Respiratory', 'Cough & Cold', 'Allergy', 'Vitamins', 
    'Skin', 'Diarrhea', 'Constipation', 'Antifungal', 'Thyroid', 'Nausea'
  ];

  // Update states if URL query changes
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Query database based on search query (name or symptom) and category
  useEffect(() => {
    async function filterMedicines() {
      setIsLoading(true);
      try {
        let query = supabase.from('medicines').select('*');

        if (selectedCategory && selectedCategory !== 'All') {
          query = query.eq('category', selectedCategory);
        }

        const searchQuery = searchParams.get('search') || '';
        if (searchQuery.trim()) {
          // Supabase supports searching by name or symptom (generic_name, category, description)
          // Since Supabase doesn't support complex OR easily in a single string filter without advanced syntax,
          // we can query and filter on name, description, category, generic_name
          query = query.or(`name.ilike.%${searchQuery}%,generic_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query.order('name', { ascending: true });
        
        if (data) {
          setMedicines(data);
        }
      } catch (e) {
        console.error('Error fetching medicines catalog:', e);
      } finally {
        setIsLoading(false);
      }
    }

    filterMedicines();
  }, [selectedCategory, searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(search, selectedCategory);
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

  const handleAddToCart = (e: React.MouseEvent, med: Medicine) => {
    e.stopPropagation();
    addToCart(med, 1);
    setShowNotification(med.name);
    setTimeout(() => {
      setShowNotification(null);
    }, 2500);
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      
      {/* Header and statistics */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Medicine Catalog / ادویات کا کیٹلاگ
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isLoading ? 'Searching...' : `Found ${medicines.length} medicines in our pharmacy / ${medicines.length} ادویات دستیاب ہیں`}
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Filter by Category</h3>
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
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  className="category-filter-btn"
                >
                  <span>{cat}</span>
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
              fontWeight: 600,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              lineHeight: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontWeight: 800 }}>💡 AI Assist Tip / مشورہ:</span>
              <span>Roman Urdu ya English mein symptoms (maslan: fever, bukhar, pet dard) likh kar search karein, AI sahi dawai dhond lega!</span>
            </div>
          </div>
        </aside>

        {/* Product Catalog view */}
        <section>
          {/* Top Search bar */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '32px' }} className="hero-search-box">
            <div className="search-input-wrapper">
              <Search size={22} color="var(--primary)" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by name, generic, or symptom (e.g. Omeprazole, pain, khansi)..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <button type="submit" className="btn-primary">
              Filter / تلاش کریں
            </button>
          </form>

          {/* Catalog grid rendering */}
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Filtering catalog items / دوائیں تلاش ہو رہی ہیں...</span>
              </div>
            </div>
          ) : medicines.length === 0 ? (
            <div style={{ 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <HelpCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No Medicines Found / کوئی دوا نہیں ملی</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                Aap ke darj kardah lafz ke mutabiq koi dawa nahi mili. Koshish karein ke aam naam istemal karein ya hamare AI Chat se poochien.
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
                Clear Filters / ری سیٹ کریں
              </button>
            </div>
          ) : (
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {medicines.map((med) => (
                <div 
                  key={med.id} 
                  className="product-card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/product/${med.id}`)}
                >
                  {med.requires_prescription && (
                    <span className="badge-prescription">Rx Required</span>
                  )}
                  
                  <div className="product-img-wrap" style={{ height: '180px' }}>
                    <img 
                      src={med.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'} 
                      alt={med.name} 
                      className="product-img"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80';
                      }}
                    />
                  </div>
                  
                  <div className="product-content" style={{ padding: '16px' }}>
                    <span className="product-category" style={{ fontSize: '0.7rem' }}>{med.category}</span>
                    <h3 className="product-name" style={{ fontSize: '1.05rem' }}>{med.name}</h3>
                    <span className="product-generic" style={{ fontSize: '0.8rem', marginBottom: '8px' }}>{med.generic_name}</span>
                    <span className="product-dosage" style={{ fontSize: '0.75rem', padding: '1px 6px', marginBottom: '12px' }}>{med.dosage}</span>
                    
                    <div className="product-footer">
                      <div className="product-price">
                        <span className="price-label">Price</span>
                        <span className="price-val" style={{ fontSize: '1.15rem' }}>Rs. {med.price_pkr}</span>
                      </div>
                      <button 
                        className="btn-icon-add" 
                        onClick={(e) => handleAddToCart(e, med)}
                        title="Add to Cart"
                        style={{ width: '36px', height: '36px' }}
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
      </div>

      {/* Toast Notification */}
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
          <span>Added **{showNotification}** to cart / کارٹ میں شامل!</span>
        </div>
      )}

      {/* Media Query Responsive CSS overrides */}
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
          .category-filter-btn {
            padding: 8px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <p style={{ marginTop: '16px' }}>Catalog Loading...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
