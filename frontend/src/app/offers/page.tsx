'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, Clock, ShoppingBag, Flame, ArrowRight } from 'lucide-react';

interface Offer {
  id: number;
  title: string;
  description: string;
  discount_text: string;
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
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 28px;
          max-width: 1200px;
          margin: 50px auto;
          padding: 0 20px;
        }
        .offer-card {
          background: #111;
          border: 1px solid #222;
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          position: relative;
        }
        .offer-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(220, 38, 38, 0.2);
          border-color: rgba(220, 38, 38, 0.4);
        }
        .offer-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }
        .offer-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          color: white;
          font-weight: 900;
          font-size: 0.72rem;
          padding: 4px 12px;
          border-radius: 50px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .offer-body {
          padding: 22px;
        }
        .offer-discount {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--primary);
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.25);
          padding: 4px 12px;
          border-radius: 50px;
          display: inline-block;
          margin-bottom: 10px;
        }
        .offer-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: white;
          margin: 0 0 8px;
        }
        .offer-desc {
          color: #888;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0 0 16px;
        }
        .offer-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #222;
          padding-top: 14px;
          margin-top: 4px;
        }
        .offer-days {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #aaa;
          font-weight: 600;
        }
        .offer-order-btn {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 8px 18px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }
        .offer-order-btn:hover { opacity: 0.85; }
        .offers-empty {
          text-align: center;
          padding: 80px 20px;
          color: #555;
        }
        .offers-empty .icon { font-size: 4rem; margin-bottom: 16px; }
        @media (max-width: 600px) {
          .offers-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Hero Section */}
      <div className="offers-hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '50px', padding: '6px 16px', marginBottom: '20px' }}>
          <Flame size={16} color="var(--primary)" />
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.82rem' }}>HOT DEALS & OFFERS</span>
        </div>
        <h1>🔥 Special Offers & Deals</h1>
        <p>Exclusive deals and bundles on your favourite Fat Pizza items. Order now before they expire!</p>
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
            const daysLeft = getDaysLeft(offer.valid_until);
            const color = badgeColors[offer.badge] || '#6366f1';
            return (
              <div className="offer-card" key={offer.id}>
                {offer.image_url && (
                  <img src={offer.image_url} alt={offer.title} className="offer-image" />
                )}
                <span className="offer-badge" style={{ background: color }}>{offer.badge}</span>
                <div className="offer-body">
                  {offer.discount_text && (
                    <span className="offer-discount">
                      <Tag size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {offer.discount_text}
                    </span>
                  )}
                  <h2 className="offer-title">{offer.title}</h2>
                  <p className="offer-desc">{offer.description}</p>
                  <div className="offer-footer">
                    <span className="offer-days">
                      <Clock size={14} />
                      {daysLeft !== null && daysLeft > 0 ? `${daysLeft} days left` : offer.valid_until ? 'Expires soon' : 'No expiry'}
                    </span>
                    <Link href="/shop" className="offer-order-btn">
                      Order Now <ShoppingBag size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expired offers (greyed out) */}
      {!loading && offers.some(o => isExpired(o.valid_until)) && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 40px', padding: '0 20px' }}>
          <h3 style={{ color: '#444', fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Expired Offers</h3>
          <div className="offers-grid" style={{ marginTop: 0 }}>
            {offers.filter(o => isExpired(o.valid_until)).map(offer => (
              <div className="offer-card" key={offer.id} style={{ opacity: 0.4, pointerEvents: 'none' }}>
                {offer.image_url && <img src={offer.image_url} alt={offer.title} className="offer-image" />}
                <span className="offer-badge" style={{ background: '#555' }}>EXPIRED</span>
                <div className="offer-body">
                  <h2 className="offer-title">{offer.title}</h2>
                  <p className="offer-desc">{offer.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
