'use client';

import React from 'react';
import { Pizza, Phone, MapPin, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer style={{ 
      backgroundColor: '#0a0a0a', 
      color: 'white',
      borderTop: '5px solid var(--primary)', 
      padding: '70px 0 35px 0',
      marginTop: 'auto' 
    }}>
      <div className="container">
        
        {/* Footer Main Content Grid */}
        <div className="footer-details-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr', gap: '40px', marginBottom: '50px' }}>
          
          {/* Logo & Call to Action */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '50%' }}>
                <Pizza size={22} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)' }}>
                Fat<span style={{ color: 'var(--primary)' }}>pizza</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#c7bfae', marginBottom: '20px', lineHeight: 1.6 }}>
              {t("It's Not Just A Pizza, An Experience. Handcrafted with passion, baked to perfection in a wood-fired oven and delivered with a touch of art.", "یہ صرف پیزا نہیں ہے، ایک یادگار تجربہ ہے۔ محبت سے تیار کردہ، لکڑی کے تندور میں پکا ہوا، اور فنی نفاست کے ساتھ پہنچایا گیا۔")}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/franchise" className="btn-primary" style={{ 
                padding: '10px 16px', 
                borderRadius: 'var(--radius-sm)', 
                background: 'var(--primary)', 
                color: 'white', 
                fontWeight: 800, 
                fontSize: '0.78rem',
                textDecoration: 'none',
                textAlign: 'center',
                boxShadow: 'none',
                display: 'inline-block'
              }}>
                {t('Franchise Opportunities Available!', 'فرنچائز کے مواقع دستیاب ہیں!')}
              </a>
            </div>
          </div>

          {/* Locations */}
          <div>
            <h5 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('Locations', 'مقامات')}</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#c7bfae' }}>
              <li>📍 {t('DHA Phase 5, Karachi', 'ڈی ایچ اے فیز 5، کراچی')}</li>
              <li>📍 {t('Gulberg III, Lahore', 'گلبرگ III، لاہور')}</li>
              <li>📍 {t('F-7 Markaz, Islamabad', 'ایف 7 مرکز، اسلام آباد')}</li>
              <li>📍 {t('Centaurus Mall, Islamabad', 'سینٹورس مال، اسلام آباد')}</li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h5 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('Opening Hours', 'اوقاتِ کار')}</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#c7bfae' }}>
              <li>
                <strong style={{ color: 'white' }}>{t('Monday - Thursday:', 'پیر تا جمعرات:')}</strong>
                <div style={{ marginTop: '2px' }}>{t('11:00 AM - 12:00 AM', 'صبح 11:00 بجے سے رات 12:00 بجے تک')}</div>
              </li>
              <li>
                <strong style={{ color: 'white' }}>{t('Friday - Sunday:', 'جمعہ تا اتوار:')}</strong>
                <div style={{ marginTop: '2px' }}>{t('11:00 AM - 02:00 AM', 'صبح 11:00 بجے سے رات 02:00 بجے تک')}</div>
              </li>
              <li>
                <strong style={{ color: 'white' }}>{t('Delivery Service:', 'ڈلیوری سروس:')}</strong>
                <div style={{ marginTop: '2px' }}>{t('24 Hours / 7 Days', '24 گھنٹے / 7 دن')}</div>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h5 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('Newsletter', 'خبر نامہ')}</h5>
            <p style={{ fontSize: '0.82rem', color: '#c7bfae', marginBottom: '16px', lineHeight: 1.5 }}>
              {t('Subscribe to get latest deals, specials, and free pizza coupons!', 'جدید ترین ڈیلز، سپیشلز اور مفت پیزا کوپن حاصل کرنے کے لیے سبسکرائب کریں!')}
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="email" 
                placeholder={t('Enter your email', 'اپنا ای میل درج کریں')} 
                style={{ 
                  flex: 1, 
                  background: 'var(--card-bg)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '8px 12px', 
                  fontSize: '0.82rem', 
                  color: 'white',
                  outline: 'none'
                }} 
              />
              <button style={{ 
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: 'var(--radius-sm)', 
                fontSize: '0.82rem', 
                fontWeight: 700, 
                cursor: 'pointer' 
              }}>
                {t('Send', 'بھیجیں')}
              </button>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#c7bfae' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="var(--primary)" /> <span>+92 300 1234567</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="var(--primary)" /> <span>orders@fatpizza.com.pk</span>
              </div>
            </div>
          </div>

        </div>

        {/* Divider line */}
        <div style={{ height: '1px', background: 'var(--border-color)', margin: '30px 0' }} />

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
            color: '#c7bfae'
          }}
        >
          <span>© {new Date().getFullYear()} {t('Fatpizza Pakistan. All rights reserved.', 'فیٹ پیزا پاکستان۔ جملہ حقوق محفوظ ہیں۔')}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800 }}>
            {t("IT'S NOT JUST A PIZZA, AN EXPERIENCE.", "یہ صرف پیزا نہیں ہے، ایک یادگار تجربہ ہے۔")}
          </span>
        </div>
      </div>
    </footer>
  );
}
