'use client';

import React from 'react';
import { Pizza, ShieldCheck, Flame, Clock, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: 'var(--card-bg)', 
      borderTop: '1px solid var(--border-color)', 
      padding: '60px 0 30px 0',
      marginTop: 'auto' 
    }}>
      <div className="container">
        {/* Trust Badges Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          paddingBottom: '40px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              background: 'var(--primary-bg)', 
              color: 'var(--primary)', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)' 
            }}>
              <Flame size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>100% Hot & Fresh</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hot and Fresh | Straight from the Oven</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              background: 'var(--primary-bg)', 
              color: 'var(--primary)', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)' 
            }}>
              <Pizza size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Expert Pizza Chefs</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unique Taste | Supervised by Expert Chefs</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              background: 'var(--primary-bg)', 
              color: 'var(--primary)', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)' 
            }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>30 Mins Free Delivery</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>30 Minute Delivery | DHA, Gulberg, and F7</p>
            </div>
          </div>
        </div>

        {/* Footer Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          gap: '40px',
          paddingBottom: '40px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '30px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Pizza size={24} color="var(--primary)" />
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--foreground)' }}>
                Fatpizza <span style={{ color: 'var(--secondary)' }}>Admin</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
              Fatpizza Administration system for managing menu items, tracking active hot and fresh delivery orders, updating store settings, and viewing kitchen analytics.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
              Helpline: +92 300 1234567 • admin@fatpizza.pk
            </p>
          </div>

          <div>
            <h5 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Popular Categories</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li>Pizzas</li>
              <li>Burgers</li>
              <li>Sandwiches</li>
              <li>Sides</li>
              <li>Desserts</li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Quality & Guarantee</h5>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>
              All our ingredients are 100% halal and fresh. Our kitchens are sanitized twice daily and cooked at high temperatures for maximum safety.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.08)',
              color: 'var(--status-delivered)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)'
            }}>
              ✨ 100% Quality & Freshness Guarantee
            </div>
          </div>
        </div>

        {/* Copy Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <span>© {new Date().getFullYear()} Fatpizza. All rights reserved.</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
            Fresh and Hot, Every Time.
          </span>
        </div>
      </div>
    </footer>
  );
}
