'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Heart, Activity, ClipboardList, Shield, Menu, X, ChevronRight } from 'lucide-react';
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
      <header className="site-header">
        <div className="container nav-container">
          {/* Bilingual Logo */}
          <Link href="/" className="logo">
            <div className="logo-icon">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <div className="mixed-label">
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>
                MediMart <span style={{ color: 'var(--secondary)' }}>Pakistan</span>
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                میڈی مارٹ پاکستان • Online Pharmacy
              </span>
            </div>
          </Link>

          {/* Navigation Menu (Desktop) */}
          <nav>
            <ul className="nav-menu">
              <li>
                <Link href="/" className={`nav-link ${isLinkActive('/') ? 'active' : ''}`}>
                  Home / ہوم
                </Link>
              </li>
              <li>
                <Link href="/shop" className={`nav-link ${isLinkActive('/shop') ? 'active' : ''}`}>
                  Shop / دکان
                </Link>
              </li>
              <li>
                <Link href="/tracking" className={`nav-link ${isLinkActive('/tracking') ? 'active' : ''}`}>
                  Track Order / ٹریک آرڈر
                </Link>
              </li>
              <li>
                <Link href="/admin" className={`nav-link ${isLinkActive('/admin') ? 'active' : ''}`}>
                  Admin Panel / ایڈمن
                </Link>
              </li>
            </ul>
          </nav>

          {/* Header Actions */}
          <div className="nav-actions">
            <div className="icon-btn-wrap" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link href="/cart" className="icon-btn" aria-label="Shopping Cart">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>

              {/* Hamburger Toggle Button (Mobile/Tablet only) */}
              <button 
                className="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Glassmorphic Drawer Overlay & Drawer */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="mobile-drawer-overlay" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          <div className="mobile-drawer">
            <div className="mobile-drawer-header">
              <Link href="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="logo-icon">
                  <Activity size={22} strokeWidth={2.5} />
                </div>
                <div className="mixed-label">
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>
                    MediMart <span style={{ color: 'var(--secondary)' }}>Pakistan</span>
                  </span>
                </div>
              </Link>
              <button 
                className="mobile-drawer-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
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
                  >
                    <span>Home / ہوم</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/shop" 
                    className={`mobile-drawer-link ${isLinkActive('/shop') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Shop / دکان</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/tracking" 
                    className={`mobile-drawer-link ${isLinkActive('/tracking') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Track Order / ٹریک</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin" 
                    className={`mobile-drawer-link ${isLinkActive('/admin') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Admin Panel / ایڈمن</span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="mobile-drawer-footer">
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                💬 AI Pharmacist active in bottom right
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Helpline: +92 300 1234567
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
