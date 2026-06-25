'use client';

import React from 'react';
import { Pizza, Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: '#2e1a12', 
      color: '#f4f1ea',
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
              It's Not Just A Pizza, An Experience. Handcrafted with passion, baked to perfection in a wood-fired oven and delivered with a touch of art.
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
                Franchise Opportunities Available!
              </a>
            </div>
          </div>

          {/* Locations */}
          <div>
            <h5 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Locations</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#c7bfae' }}>
              <li>📍 DHA Phase 5, Karachi</li>
              <li>📍 Gulberg III, Lahore</li>
              <li>📍 F-7 Markaz, Islamabad</li>
              <li>📍 Centaurus Mall, Islamabad</li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h5 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Opening Hours</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#c7bfae' }}>
              <li>
                <strong style={{ color: 'white' }}>Monday - Thursday:</strong>
                <div style={{ marginTop: '2px' }}>11:00 AM - 12:00 AM</div>
              </li>
              <li>
                <strong style={{ color: 'white' }}>Friday - Sunday:</strong>
                <div style={{ marginTop: '2px' }}>11:00 AM - 02:00 AM</div>
              </li>
              <li>
                <strong style={{ color: 'white' }}>Delivery Service:</strong>
                <div style={{ marginTop: '2px' }}>24 Hours / 7 Days</div>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h5 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Newsletter</h5>
            <p style={{ fontSize: '0.82rem', color: '#c7bfae', marginBottom: '16px', lineHeight: 1.5 }}>
              Subscribe to get latest deals, specials, and free pizza coupons!
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                style={{ 
                  flex: 1, 
                  background: '#3d251a', 
                  border: '1px solid #42281d', 
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
                Send
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
        <div style={{ height: '1px', background: '#42281d', margin: '30px 0' }} />

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
          <span>© {new Date().getFullYear()} Fatpizza Pakistan. All rights reserved.</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800 }}>
            IT'S NOT JUST A PIZZA, AN EXPERIENCE.
          </span>
        </div>
      </div>
    </footer>
  );
}
