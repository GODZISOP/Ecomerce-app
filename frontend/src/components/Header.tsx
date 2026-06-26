'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, ChevronRight, Pizza, Flame, MapPin, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { language, setLanguage, t, mounted } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    city: '',
    area: '',
    orderType: 'delivery'
  });

  useEffect(() => {
    const updateLocation = () => {
      const city = localStorage.getItem('fatpizza_user_city') || '';
      const area = localStorage.getItem('fatpizza_user_area') || '';
      const orderType = localStorage.getItem('fatpizza_order_type') || 'delivery';
      setLocationDetails({ city, area, orderType });
    };

    updateLocation();
    window.addEventListener('location-updated', updateLocation);
    return () => {
      window.removeEventListener('location-updated', updateLocation);
    };
  }, []);

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <header className="site-header" style={{ background: '#0d0d0e', borderBottom: '3px solid var(--primary)' }}>
        <div className="container nav-container" style={{ height: '90px' }}>
          {/* Pizza Logo */}
          <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon" style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%' }}>
              <Pizza size={24} strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.7rem', fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
                Fat<span style={{ color: 'var(--primary)' }}>pizza</span>
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '-4px' }}>
                {t('Fresh & Hot', 'تازہ اور گرم')}
              </span>
            </div>
          </Link>

          {/* Location Selector */}
          <div 
            onClick={() => window.dispatchEvent(new Event('open-location-modal'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '8px 14px',
              borderRadius: '12px',
              transition: 'all 0.2s',
              marginLeft: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            className="header-location-selector"
          >
            <div style={{
              background: 'rgba(241, 60, 11, 0.15)',
              color: '#f13c0b',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={18} color="#f13c0b" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }} className="location-text">
              <span style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                lineHeight: '1.2'
              }}>
                {locationDetails.orderType === 'pickup' ? t('Pick-up from', 'پک اپ کریں') : t('Delivery to', 'ڈلیوری تا')} 
                <ChevronDown size={12} style={{ opacity: 0.8 }} />
              </span>
              <span style={{ 
                fontSize: '0.72rem', 
                color: '#bbbbbb',
                maxWidth: '180px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '1.2',
                marginTop: '2px'
              }}>
                {locationDetails.area ? `${locationDetails.area}, ${locationDetails.city}` : t('Select Location', 'لوکیشن منتخب کریں')}
              </span>
            </div>
          </div>

          {/* Navigation Menu (Desktop) */}
          <nav>
            <ul className="nav-menu">
              <li>
                <Link 
                  href="/" 
                  className={`nav-link ${isLinkActive('/') ? 'active' : ''}`} 
                  style={{ 
                    color: isLinkActive('/') ? '#000000' : 'white', 
                    background: isLinkActive('/') ? 'white' : 'transparent',
                    fontWeight: 750,
                    textDecoration: 'none',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  <span>{t('Home', 'ہوم')}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/shop" 
                  className={`nav-link ${isLinkActive('/shop') ? 'active' : ''}`} 
                  style={{ 
                    color: isLinkActive('/shop') ? '#000000' : 'white', 
                    background: isLinkActive('/shop') ? 'white' : 'transparent',
                    fontWeight: 750,
                    textDecoration: 'none',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  <span>{t('Menu', 'مینو')}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/tracking" 
                  className={`nav-link ${isLinkActive('/tracking') ? 'active' : ''}`} 
                  style={{ 
                    color: isLinkActive('/tracking') ? '#000000' : 'white', 
                    background: isLinkActive('/tracking') ? 'white' : 'transparent',
                    fontWeight: 750,
                    textDecoration: 'none',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  <span>{t('Track Order', 'آرڈر ٹریک کریں')}</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Header Actions */}
          <div className="nav-actions">
            <div className="icon-btn-wrap" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Language Switcher */}
              {mounted && (
                <select
                  className="hide-on-tablet"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  style={{
                    background: 'var(--card-bg)',
                    color: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="en">English</option>
                  <option value="ur">اردو</option>
                </select>
              )}

              {/* Order Now button */}
              <Link href="/shop" className="btn-primary hide-on-mobile" style={{ padding: '10px 16px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '0.85rem' }}>
                {t('Order Now', 'آرڈر کریں')}
              </Link>

              <Link href="/cart" className="icon-btn" aria-label="Shopping Cart" style={{ color: 'white', borderColor: 'var(--border-color)', background: 'var(--card-bg)' }}>
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="badge" style={{ background: 'var(--primary)' }}>{cartCount}</span>}
              </Link>

              {/* Hamburger Toggle Button (Mobile/Tablet only) */}
              <button 
                className="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                style={{ color: 'white' }}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Drawer */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="mobile-drawer-overlay" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          <div className="mobile-drawer" style={{ background: '#0d0d0e', color: 'white', borderLeft: '1px solid var(--border-color)' }}>
            <div className="mobile-drawer-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <Link href="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="logo-icon" style={{ background: 'var(--primary)', color: 'white' }}>
                  <Pizza size={22} strokeWidth={2.5} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)' }}>
                    Fat<span style={{ color: 'var(--primary)' }}>pizza</span>
                  </span>
                </div>
              </Link>
              <button 
                className="mobile-drawer-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{ color: 'white', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'block', flex: 1 }}>
              <ul className="mobile-drawer-menu">
                <li>
                  <Link 
                    href="/" 
                    className={`mobile-drawer-link ${isLinkActive('/') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ color: 'white' }}
                  >
                    <span>{t('Home', 'ہوم')}</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/shop" 
                    className={`mobile-drawer-link ${isLinkActive('/shop') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ color: 'white' }}
                  >
                    <span>{t('Menu', 'مینو')}</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/tracking" 
                    className={`mobile-drawer-link ${isLinkActive('/tracking') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ color: 'white' }}
                  >
                    <span>{t('Track Order', 'آرڈر ٹریک کریں')}</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="mobile-drawer-footer" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={16} /> {t('AI Chat Helper Active', 'اے آئی چیٹ اسسٹنٹ فعال')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('Fatpizza Call Center: +92 300 1234567', 'فیٹ پیزا کال سینٹر: 1234567-300-92+')}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
