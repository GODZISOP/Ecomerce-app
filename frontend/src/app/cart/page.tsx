'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ArrowLeft, ShieldCheck, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useCart, Addon } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase, PizzaItem } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';

// Dynamically import the LocationMapComponent to avoid SSR window-is-not-defined errors in Next.js
const LocationMapComponent = dynamic(
  () => import('@/components/LocationMapComponent'),
  { 
    ssr: false, 
    loading: () => (
      <div style={{ 
        height: '240px', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'rgba(255, 255, 255, 0.05)', 
        borderRadius: 'var(--radius-sm)',
        border: '1px dashed var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        📍 Loading map layout...
      </div>
    ) 
  }
);

// Restaurant kitchen coordinates (DHA Phase 5/Gulshan-e-Iqbal hub center)
const RESTAURANT_COORDS = { lat: 24.96388, lon: 67.12789 };

// Haversine formula to compute distance in kilometers between two coords
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

export default function CartPage() {
  const router = useRouter();
  const { cart, updateCartQty, removeFromCart, cartSubtotal } = useCart();
  const { t } = useLanguage();

  // Location Map States
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>({ lat: 24.96388, lng: 67.12789 });
  const [distance, setDistance] = useState<number | null>(null);
  const [shippingFee, setShippingFee] = useState(120);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasSetLocation, setHasSetLocation] = useState(false);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoadingAddons, setIsLoadingAddons] = useState(false);

  const grandTotal = cartSubtotal + (cart.length > 0 ? shippingFee : 0);

  // Load saved location on mount
  useEffect(() => {
    setIsMounted(true);
    const savedCity = localStorage.getItem('fatpizza_user_city');
    const savedArea = localStorage.getItem('fatpizza_user_area');
    const savedLat = localStorage.getItem('fatpizza_checkout_lat');
    const savedLng = localStorage.getItem('fatpizza_checkout_lng');
    
    const locationSet = localStorage.getItem('fatpizza_location_set');
    if (locationSet === 'true') {
      setHasSetLocation(true);
    }

    let initialLat = 24.96388;
    let initialLng = 67.12789;

    if (savedLat && savedLng) {
      initialLat = parseFloat(savedLat);
      initialLng = parseFloat(savedLng);
    } else if (savedArea) {
      const area = savedArea.toLowerCase();
      if (area.includes('jauhar')) {
        initialLat = 24.9142; initialLng = 67.1234;
      } else if (area.includes('gulshan')) {
        initialLat = 24.9180; initialLng = 67.0971;
      } else if (area.includes('scheme 33')) {
        initialLat = 24.9678; initialLng = 67.1472;
      } else if (area.includes('saadi')) {
        initialLat = 24.9575; initialLng = 67.1725;
      } else if (area.includes('malir')) {
        initialLat = 24.8922; initialLng = 67.1947;
      }
    }

    setMarkerPos({ lat: initialLat, lng: initialLng });
    const dist = getDistanceFromLatLonInKm(RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lon, initialLat, initialLng);
    setDistance(dist);
    updateShippingFeeByDistance(dist, initialLat, initialLng);

    // Fetch Addons for Cart Page upsell
    async function fetchAddons() {
      setIsLoadingAddons(true);
      try {
        const { data, error } = await supabase.from('addons').select('*').order('name');
        if (data && data.length > 0) {
          setAddons(data);
        } else {
          setAddons([
            { id: 1, name: 'Pepsi', price_pkr: 100 },
            { id: 2, name: 'Sprite', price_pkr: 100 },
            { id: 3, name: 'Ketchup', price_pkr: 20 },
            { id: 4, name: 'Extra Cheese', price_pkr: 150 }
          ]);
        }
      } catch (e) {
        setAddons([
          { id: 1, name: 'Pepsi', price_pkr: 100 },
          { id: 2, name: 'Sprite', price_pkr: 100 },
          { id: 3, name: 'Ketchup', price_pkr: 20 },
          { id: 4, name: 'Extra Cheese', price_pkr: 150 }
        ]);
      } finally {
        setIsLoadingAddons(false);
      }
    }
    fetchAddons();
  }, []);

  // Update shipping fee dynamically and sync with localStorage
  const updateShippingFeeByDistance = (distKm: number, lat: number, lng: number) => {
    let fee = 150;
    if (distKm <= 1) {
      fee = 120;
    } else if (distKm <= 3) {
      fee = 150;
    } else if (distKm <= 6) {
      fee = 200;
    } else if (distKm <= 10) {
      fee = 250;
    } else if (distKm <= 15) {
      fee = 350;
    } else {
      fee = 500;
    }
    setShippingFee(fee);
    
    // Save to localStorage so Checkout Page automatically reads the exact same calculations
    localStorage.setItem('fatpizza_checkout_fee', fee.toString());
    localStorage.setItem('fatpizza_checkout_distance', distKm.toString());
    localStorage.setItem('fatpizza_checkout_lat', lat.toString());
    localStorage.setItem('fatpizza_checkout_lng', lng.toString());
  };

  // Browser Geolocation / GPS Finder
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setMarkerPos({ lat: latitude, lng: longitude });
          const dist = getDistanceFromLatLonInKm(RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lon, latitude, longitude);
          setDistance(dist);
          updateShippingFeeByDistance(dist, latitude, longitude);
          setIsDetectingLocation(false);
          setHasSetLocation(true);
          localStorage.setItem('fatpizza_location_set', 'true');
        },
        (error) => {
          console.error("GPS detection error:", error);
          alert(t('Could not detect location. Please pin manually on map.', 'لوکیشن معلوم نہیں کی جا سکی۔ نقشے پر خود منتخب کریں۔'));
          setIsDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert(t('Geolocation is not supported by your browser.', 'آپ کا براؤزر لوکیشن کو سپورٹ نہیں کرتا۔'));
    }
  };

  useEffect(() => {
    if (isMounted) {
      const locationSet = localStorage.getItem('fatpizza_location_set');
      if (locationSet !== 'true') {
        handleDetectLocation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // Map Click update callback
  const handleLocationChange = (lat: number, lng: number) => {
    setMarkerPos({ lat, lng });
    const dist = getDistanceFromLatLonInKm(RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lon, lat, lng);
    setDistance(dist);
    updateShippingFeeByDistance(dist, lat, lng);
    setHasSetLocation(true);
    localStorage.setItem('fatpizza_location_set', 'true');
  };

  const handleQtyChange = (id: string, currentQty: number, change: number) => {
    const nextQty = currentQty + change;
    if (nextQty >= 1) {
      updateCartQty(id, nextQty);
    }
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
  };

  const handleAddStandaloneAddon = (addon: Addon) => {
    const addonAsItem: PizzaItem = {
      id: 10000 + addon.id, // Offset ID so it doesn't conflict with real products
      name: addon.name,
      generic_name: 'Add-on',
      category: 'Sides',
      price_pkr: addon.price_pkr,
      stock: 999,
      dosage: '1 serving',
      description: 'Extra add-on',
      manufacturer: 'Fatpizza Kitchen',
      requires_prescription: false,
      image_url: addon.image_url || 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop'
    };
    // @ts-ignore
    useCart().addToCart?.(addonAsItem, 1) || null; // Wait, we already have addToCart in scope!
    addToCart(addonAsItem as any, 1, []);
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          {t('Your Basket', 'شاپنگ کارٹ')}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {t('Review selected food items before checking out', 'چیک آؤٹ کرنے سے پہلے منتخب کردہ کھانوں کا جائزہ لیں')}
        </p>
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '80px 20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-bg)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <ShoppingCart size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>{t('Your Basket is Empty', 'کارٹ خالی ہے')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
            {t("You haven't added any pizza or burger to your basket yet.", 'آپ نے ابھی تک اپنے کارٹ میں کوئی پیزا یا برگر شامل نہیں کیا ہے۔')}
          </p>
          <Link href="/shop" className="btn-primary" style={{ display: 'inline-flex', background: 'var(--primary)', color: 'white', textDecoration: 'none' }}>
            {t('Go to Menu', 'مینو پر جائیں')} <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        /* Full Cart View */
        <div className="tab-container" style={{ display: 'flex', gap: '32px' }}>
          
          {/* Left panel: list of items */}
          <div className="cart-main" style={{ flex: 1.4 }}>
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}>
              {cart.map((item) => {
                const addonsPrice = (item.addons || []).reduce((sum, a) => sum + a.price_pkr, 0);
                const itemTotal = (item.price_pkr + addonsPrice) * item.quantity;
                
                return (
                  <div key={item.cartItemId} style={{
                  display: 'grid',
                  gridTemplateColumns: '80px minmax(200px, 1fr) auto auto 40px',
                  gap: '20px',
                  padding: '24px',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)'
                }} className="cart-item-row">
                  
                  {/* Image */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Name and toppings */}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '2px' }}>
                      <Link href={`/product/${item.id}`} style={{ color: 'var(--foreground)', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--foreground)'}>
                        {t(item.name)}
                      </Link>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', lineBreak: 'anywhere' }}>{t(item.generic_name)}</p>
                    
                    {item.addons && item.addons.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px', marginBottom: '8px' }}>
                        {item.addons.map((addon) => (
                          <span key={addon.id} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--background)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            + {addon.name} (Rs. {addon.price_pkr})
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--primary-bg)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                      {t(item.dosage)}
                    </span>
                  </div>

                  {/* Qty Selector */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--background)',
                    padding: '2px',
                    width: 'fit-content'
                  }}>
                    <button 
                      onClick={() => handleQtyChange(item.cartItemId, item.quantity, -1)}
                      style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
                    >-</button>
                    <span style={{ width: '30px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                    <button 
                      onClick={() => handleQtyChange(item.cartItemId, item.quantity, 1)}
                      style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700 }}
                    >+</button>
                  </div>

                  {/* Total price */}
                  <div style={{ textAlign: 'right', justifySelf: 'end' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>Rs. {itemTotal}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rs. {item.price_pkr + addonsPrice} {t('each', 'فی عدد')}</div>
                  </div>

                  {/* Remove button */}
                  <button 
                    onClick={() => handleRemove(item.cartItemId)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--status-cancelled)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
                );
              })}
              
              {/* Back to shop */}
              <div style={{ padding: '20px 24px', background: 'var(--background)' }}>
                <Link href="/shop" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}>
                  <ArrowLeft size={16} /> {t('Back to Food Menu', 'مزید آرڈر کریں')}
                </Link>
              </div>
            </div>

            {/* Extras / Addons Section (Premium UI) */}
            <div style={{
              background: 'linear-gradient(145deg, var(--card-bg) 0%, rgba(20,20,20,0.8) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              marginTop: '32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--primary-bg)', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-display)', margin: 0 }}>
                    {t('Frequently Bought Together', 'اکثر ساتھ خریدا جاتا ہے')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    {t('Add these extras to complete your meal', 'اپنے کھانے کو مکمل کرنے کے لیے یہ چیزیں شامل کریں')}
                  </p>
                </div>
              </div>
              
              {isLoadingAddons ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '40px 0', color: 'var(--primary)' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontWeight: 600 }}>{t('Loading extras...', 'لوڈ ہو رہا ہے...')}</span>
                </div>
              ) : addons.length > 0 ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px' 
                }}>
                  {addons.map(addon => (
                    <div key={addon.id} 
                      className="addon-card"
                      style={{
                        position: 'relative',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255, 255, 255, 0.02)',
                        overflow: 'hidden',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        gap: '16px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      }}
                    >
                      <div style={{ 
                        position: 'absolute', 
                        top: '-20px', 
                        right: '-20px', 
                        width: '80px', 
                        height: '80px', 
                        background: 'var(--primary)', 
                        opacity: 0.1, 
                        borderRadius: '50%',
                        filter: 'blur(20px)'
                      }} />
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1, flex: 1 }}>
                        {addon.image_url ? (
                          <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={addon.image_url} alt={addon.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <Plus size={24} />
                          </div>
                        )}
                        <div>
                          <h4 style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--foreground)' }}>{addon.name}</h4>
                          <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>Rs. {addon.price_pkr}</div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleAddStandaloneAddon(addon)}
                        style={{ 
                          padding: '10px 24px', 
                          background: 'linear-gradient(to right, var(--primary), #ff6b3d)', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: 'var(--radius-pill)', 
                          fontWeight: 800, 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          zIndex: 1,
                          transition: 'opacity 0.2s, transform 0.1s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Plus size={18} strokeWidth={3} /> <span className="hide-on-mobile">{t('Add', 'شامل کریں')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>


            {/* Delivery Map Selection Card */}
            {isMounted && (
              <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                padding: '24px',
                marginTop: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={20} color="var(--primary)" /> {t('Set Delivery Address & Map Pin', 'ڈیلیوری ایڈریس اور لوکیشن منتخب کریں')}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      {t('Select your exact location on the map to calculate accurate delivery charges.', 'ڈیلیوری چارجز کے لیے نقشے پر اپنی درست لوکیشن پن کریں۔')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(241, 60, 11, 0.15)'
                    }}
                  >
                    <Navigation size={12} style={{ transform: 'rotate(45deg)' }} />
                    {isDetectingLocation ? t('Locating...', 'معلوم کی جا رہی ہے...') : t('Use My GPS', 'موجودہ لوکیشن')}
                  </button>
                </div>

                {/* Map Component Container */}
                <div style={{ 
                  height: '300px', 
                  width: '100%', 
                  borderRadius: 'var(--radius-md)', 
                  overflow: 'hidden', 
                  border: '1px solid var(--border-color)', 
                  zIndex: 1
                }}>
                  <LocationMapComponent 
                    position={markerPos} 
                    setPosition={setMarkerPos} 
                    onLocationUpdate={handleLocationChange} 
                  />
                </div>

                {/* Dynamic Details Stats */}
                {distance !== null && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '16px', 
                    marginTop: '16px',
                    fontSize: '0.8rem',
                    background: 'var(--background)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t('Kitchen Distance:', 'کچن سے فاصلہ:')}</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--foreground)', marginTop: '4px' }}>
                        {distance.toFixed(2)} km
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t('Delivery Charges:', 'ڈیلیوری فیس:')}</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--primary)', marginTop: '4px' }}>
                        Rs. {shippingFee}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t('Estimated Delivery:', 'اندازہ وقت ترسیل:')}</span>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--foreground)', marginTop: '4px' }}>
                        {distance <= 1 ? '10 - 20 mins' : distance <= 3 ? '15 - 25 mins' : distance <= 6 ? '25 - 35 mins' : distance <= 12 ? '35 - 50 mins' : '50 - 75 mins'}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel: order summary checkout card */}
          <div className="cart-summary" style={{ flex: 0.8 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              {t('Order Details', 'بل کی تفصیل')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('Subtotal', 'کل قیمت')}</span>
                <span style={{ fontWeight: 700 }}>Rs. {cartSubtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('Delivery Fee', 'ڈلیوری فیس')}</span>
                <span style={{ fontWeight: 700 }}>
                  Rs. {shippingFee}
                  {distance !== null && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textAlign: 'right', fontWeight: 600 }}>
                      ({distance.toFixed(1)} km distance)
                    </span>
                  )}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                🛵 {t('Dynamic delivery charges based on map pin.', 'نقشے پر لوکیشن کے مطابق ڈیلیوری چارجز۔')}
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                <span style={{ fontWeight: 900 }}>{t('Total', 'کل بل')}</span>
                <span style={{ fontWeight: 900, color: 'var(--primary)' }}>Rs. {grandTotal}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                if (!hasSetLocation) {
                  e.preventDefault();
                  alert(t('Please use GPS or map pin to set your delivery location first!', 'براہ کرم پہلے جی پی ایس یا نقشے سے اپنی ڈیلیوری لوکیشن منتخب کریں!'));
                } else {
                  router.push('/checkout');
                }
              }}
              className="btn-primary" 
              style={{ display: 'flex', width: '100%', padding: '16px 24px', justifyContent: 'center', fontSize: '1rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, textDecoration: 'none' }}
            >
              {t('Proceed to Checkout', 'چیک آؤٹ کی طرف جائیں')} <ArrowRight size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              marginTop: '16px',
              fontWeight: 700
            }}>
              <ShieldCheck size={16} color="var(--primary)" /> {t('Cash on Delivery (COD) Available', 'کیش آن ڈلیوری (سی او ڈی) دستیاب ہے')}
            </div>

          </div>

        </div>
      )}

      {/* Cart item table layout style custom overrides */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .tab-container {
            flex-direction: column !important;
            gap: 20px !important;
          }
          .cart-summary {
            position: relative !important;
            top: 0 !important;
            width: 100% !important;
            margin-top: 20px;
          }
          .cart-item-row {
            display: grid !important;
            grid-template-columns: 80px 1fr 40px !important;
            grid-template-rows: auto auto auto !important;
            padding: 16px !important;
            gap: 12px !important;
            align-items: center !important;
          }
          .cart-item-row > div:nth-child(1) {
            grid-column: 1 !important;
            grid-row: 1 / span 3 !important;
            align-self: center !important;
          }
          .cart-item-row > div:nth-child(2) {
            grid-column: 2 !important;
            grid-row: 1 !important;
            justify-self: start !important;
          }
          .cart-item-row > div:nth-child(3) {
            grid-column: 2 !important;
            grid-row: 2 !important;
            justify-self: start !important;
            align-self: center !important;
            margin-top: 6px !important;
            margin-bottom: 4px !important;
          }
          .cart-item-row > div:nth-child(4) {
            grid-column: 2 !important;
            grid-row: 3 !important;
            justify-self: start !important;
            text-align: left !important;
            align-self: center !important;
            margin-top: 4px !important;
          }
          .cart-item-row > button:nth-child(5) {
            grid-column: 3 !important;
            grid-row: 1 / span 3 !important;
            justify-self: center !important;
            align-self: center !important;
          }
        }
      `}</style>
    </div>
  );
}
