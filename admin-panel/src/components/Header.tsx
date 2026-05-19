'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Heart, Activity, ClipboardList, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
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

        {/* Navigation Menu */}
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
          <div className="icon-btn-wrap" style={{ display: 'flex', gap: '12px' }}>
            <Link href="/cart" className="icon-btn" aria-label="Shopping Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
