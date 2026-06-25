'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, ChevronRight, Pizza, Flame } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <header className="site-header" style={{ background: '#2e1a12', borderBottom: '3px solid var(--primary)' }}>
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
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--border-color)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '-4px' }}>
                Fresh & Hot
              </span>
            </div>
          </Link>

          {/* Navigation Menu (Desktop) */}
          <nav>
            <ul className="nav-menu">
              <li>
                <Link href="/" className={`nav-link ${isLinkActive('/') ? 'active' : ''}`} style={{ color: 'white' }}>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className={`nav-link ${isLinkActive('/shop') ? 'active' : ''}`} style={{ color: 'white' }}>
                  <span>Menu</span>
                </Link>
              </li>
              <li>
                <Link href="/tracking" className={`nav-link ${isLinkActive('/tracking') ? 'active' : ''}`} style={{ color: 'white' }}>
                  <span>Track Order</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className={`nav-link ${isLinkActive('/admin') ? 'active' : ''}`} style={{ color: 'white' }}>
                  <span>Admin Panel</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Header Actions */}
          <div className="nav-actions">
            <div className="icon-btn-wrap" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Order Now button as seen in image */}
              <Link href="/shop" className="btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '0.85rem' }}>
                Order Now
              </Link>

              <Link href="/cart" className="icon-btn" aria-label="Shopping Cart" style={{ color: 'white', borderColor: '#42281d', background: '#3d251a' }}>
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
          
          <div className="mobile-drawer" style={{ background: '#2e1a12', color: 'white' }}>
            <div className="mobile-drawer-header" style={{ borderBottom: '1px solid #42281d' }}>
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
                style={{ color: 'white', background: '#3d251a', border: 'none' }}
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
                    <span>Home</span>
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
                    <span>Menu</span>
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
                    <span>Track Order</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin" 
                    className={`mobile-drawer-link ${isLinkActive('/admin') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ color: 'white' }}
                  >
                    <span>Admin Panel</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="mobile-drawer-footer" style={{ borderTop: '1px solid #42281d' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={16} /> AI Chat Helper Active
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--border-color)' }}>
                Fatpizza Call Center: +92 300 1234567
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
