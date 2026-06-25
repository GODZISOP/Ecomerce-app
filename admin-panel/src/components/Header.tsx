'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Heart, Pizza, ClipboardList, Shield } from 'lucide-react';
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
            <Pizza size={24} strokeWidth={2.5} />
          </div>
          <div className="mixed-label">
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1.1 }}>
              Fatpizza <span style={{ color: 'var(--secondary)' }}>Admin</span>
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Hot & Fresh • Administration
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav>
          <ul className="nav-menu">
            <li>
              <Link href="/admin" className={`nav-link ${isLinkActive('/admin') ? 'active' : ''}`}>
                Admin Panel
              </Link>
            </li>
          </ul>
        </nav>

      </div>
    </header>
  );
}
