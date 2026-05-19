'use client';

import React from 'react';
import { Activity, ShieldCheck, HeartPulse, Clock, Sparkles } from 'lucide-react';

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
        <div className="footer-trust-grid">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              background: 'var(--primary-bg)', 
              color: 'var(--primary)', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)' 
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>100% Authentic Medicines</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>100% Asli Dawaeen | براہ راست مینوفیکچررز سے</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              background: 'var(--primary-bg)', 
              color: 'var(--primary)', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)' 
            }}>
              <HeartPulse size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Registered Pharmacists</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Muanas Pharmacists | مستند فارماسسٹس کی نگرانی</p>
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
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Cash on Delivery (COD)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paisa Wasooli par Adaigi | پورے پاکستان میں دستیاب</p>
            </div>
          </div>
        </div>

        {/* Footer Details */}
        <div className="footer-details-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Activity size={24} color="var(--primary)" />
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)' }}>
                MediMart <span style={{ color: 'var(--secondary)' }}>Pakistan</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
              MediMart Pakistan is a premier digital healthcare pharmacy dedicated to providing authentic medicines, healthcare items, and expert guidance directly to homes across Pakistan. COD is available in all major cities.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
              Helpline: +92 300 1234567 • info@medimart.pk
            </p>
          </div>

          <div>
            <h5 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Popular Categories / اقسام</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li>Painkillers / درد کش ادویات</li>
              <li>Antibiotics / اینٹی بائیوٹکس</li>
              <li>Diabetes / شوگر کی دوا</li>
              <li>Blood Pressure / بلڈ پریشر</li>
              <li>Vitamins / وٹامنز</li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Security & Legality</h5>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>
              Some medicines require a valid doctor prescription. Please keep a digital copy of your prescription ready before delivery.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--status-cancelled)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)'
            }}>
              ⚠️ Prescription Required for Rx labeled drugs
            </div>
          </div>
        </div>

        {/* Copy Bar */}
        <div 
          className="footer-copy-bar"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <span>© {new Date().getFullYear()} MediMart Pakistan. All rights reserved.</span>
          <span className="urdu-text" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>
            ہماری ترجیح، آپ کی صحت اور آسانی۔
          </span>
        </div>
      </div>
    </footer>
  );
}
