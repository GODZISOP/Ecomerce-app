'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, Clock, ShoppingBag, Flame, ArrowRight, X } from 'lucide-react';

interface Offer {
  id: number;
  title: string;
  description: string;
  discount_text: string;
  price_pkr?: number;
  badge: string;
  image_url: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/offers')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setOffers(data.offers.filter((o: Offer) => o.is_active));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isExpired = (valid_until: string) => {
    if (!valid_until) return false;
    return new Date(valid_until) < new Date();
  };

  const getDaysLeft = (valid_until: string) => {
    if (!valid_until) return null;
    const diff = Math.ceil((new Date(valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const badgeColors: Record<string, string> = {
    LIMITED: '#ef4444',
    BUNDLE: '#f59e0b',
    OFFER: '#10b981',
    HOT: '#f97316',
    NEW: '#6366f1',
    SALE: '#ec4899',
  };

  return (
    <>
      <style>{`
        .offers-hero {
          background: linear-gradient(135deg, #0d0d0e 0%, #1a0000 60%, #2d0808 100%);
          padding: 80px 20px 60px;
          text-align: center;
          border-bottom: 2px solid var(--primary);
          position: relative;
          overflow: hidden;
        }
        .offers-hero::before {
          content: '🍕';
          position: absolute;
          font-size: 200px;
          top: -40px;
          right: -30px;
          opacity: 0.05;
        }
        .offers-hero h1 {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 900;
          color: white;
          margin: 0 0 12px;
        }
        .offers-hero p {
          color: #aaa;
          font-size: 1.05rem;
          max-width: 500px;
          margin: 0 auto;
        }
        .offers-grid {
          display: flex;
          flex-direction: column;
          gap: 60px;
          max-width: 1400px;
          width: 100%;
          margin: 60px auto;
          padding: 0 20px;
        }
        .offer-card {
          background: #000;
          border-radius: 36px;
          overflow: hidden;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          position: relative;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.05);
          width: 100%;
        }
        .offer-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(220, 38, 38, 0.2);
          border-color: rgba(220, 38, 38, 0.5);
        }
        .offer-image-wrapper {
          width: 100%;
          position: relative;
        }
        .offer-image {
          width: 100%;
          height: auto;
          max-height: 700px;
          object-fit: cover;
          object-position: top;
          display: block;
          transition: transform 0.7s ease;
        }
        .offer-card:hover .offer-image {
          transform: scale(1.02);
        }
        .offer-badge {
          position: absolute;
          top: 24px;
          left: 24px;
          color: white;
          font-weight: 900;
          font-size: 0.85rem;
          padding: 6px 16px;
          border-radius: 50px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          z-index: 10;
        }
        .offers-empty {
          text-align: center;
          padding: 80px 20px;
          color: #555;
        }
        .offers-empty .icon { font-size: 4rem; margin-bottom: 16px; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        .modal-content {
          background: #111;
          border: 1px solid #333;
          border-radius: 24px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 30px 60px rgba(0,0,0,0.8);
          animation: slideUp 0.3s ease;
        }
        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0,0,0,0.5);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          transition: background 0.2s;
        }
        .modal-close:hover {
          background: rgba(220, 38, 38, 0.8);
        }
        .modal-img {
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: cover;
          display: block;
        }
        .modal-body {
          padding: 40px;
        }
        .modal-discount {
          font-size: 1rem;
          font-weight: 800;
          color: var(--primary);
          background: rgba(220, 38, 38, 0.15);
          border: 1px solid rgba(220, 38, 38, 0.3);
          padding: 8px 18px;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
        }
        .modal-title {
          font-size: clamp(2rem, 5vw, 2.5rem);
          font-weight: 900;
          color: white;
          margin: 0 0 16px;
          line-height: 1.1;
          letter-spacing: -0.5px;
        }
        .modal-desc {
          color: #bbb;
          font-size: 1.1rem;
          line-height: 1.7;
          margin: 0 0 32px;
        }
        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 24px;
        }
        .modal-days {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          color: #999;
          font-weight: 600;
        }
        .modal-days svg {
          color: var(--primary);
        }
        .modal-order-btn {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 14px 32px;
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.3);
        }
        .modal-order-btn:hover { 
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(220, 38, 38, 0.4);
          filter: brightness(1.1);
        }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        @media (max-width: 900px) {
          .offer-image {
            max-height: 400px;
          }
        }
        @media (max-width: 500px) {
          .modal-footer { flex-direction: column; gap: 20px; align-items: stretch; }
          .modal-order-btn { justify-content: center; width: 100%; }
          .modal-days { justify-content: center; }
          .modal-body { padding: 24px; }
          .offer-image { max-height: 300px; }
          .offer-card { border-radius: 20px; }
        }
      `}</style>

      {/* Hero Section */}
      <div className="offers-hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '50px', padding: '6px 16px', marginBottom: '20px' }}>
          <Flame size={16} color="var(--primary)" />
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.82rem' }}>HOT DEALS & OFFERS</span>
        </div>
        <h1>🔥 Special Offers & Deals</h1>
        <p>Click on any poster to view details and grab the deal before it expires!</p>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#555' }}>Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className="offers-empty">
          <div className="icon">🎁</div>
          <h2 style={{ color: '#444', margin: '0 0 8px' }}>No Active Offers Right Now</h2>
          <p>Check back soon for exciting deals and bundles!</p>
          <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '20px', background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: '50px', textDecoration: 'none', fontWeight: 800 }}>
            Browse Menu <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="offers-grid">
          {offers.filter(o => !isExpired(o.valid_until)).map(offer => {
            const color = badgeColors[offer.badge] || '#6366f1';
            return (
              <div className="offer-card" key={offer.id} onClick={() => window.location.href = `/offers/${offer.id}`}>
                <div className="offer-image-wrapper">
                  {offer.image_url && (
                    <img src={offer.image_url} alt={offer.title} className="offer-image" />
                  )}
                  <span className="offer-badge" style={{ background: color }}>{offer.badge}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expired offers (greyed out) */}
      {!loading && offers.some(o => isExpired(o.valid_until)) && (
        <div style={{ maxWidth: '1000px', margin: '0 auto 40px', padding: '0 20px' }}>
          <h3 style={{ color: '#444', fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Expired Offers</h3>
          <div className="offers-grid" style={{ marginTop: 0 }}>
            {offers.filter(o => isExpired(o.valid_until)).map(offer => (
              <div className="offer-card" key={offer.id} style={{ opacity: 0.4, pointerEvents: 'none' }}>
                <div className="offer-image-wrapper">
                  {offer.image_url && <img src={offer.image_url} alt={offer.title} className="offer-image" />}
                  <span className="offer-badge" style={{ background: '#555' }}>EXPIRED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


    </>
  );
}
