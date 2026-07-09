'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Truck, ArrowLeft, ClipboardList, MapPin, Navigation } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useCart();
  const { t } = useLanguage();

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Karachi');
  const [whatsapp, setWhatsapp] = useState('');
  const [note, setNote] = useState('');
  const [changeFor, setChangeFor] = useState('');
  
  // Location Map States
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>({ lat: 24.96388, lng: 67.12789 });
  const [distance, setDistance] = useState<number | null>(null);
  const [shippingFee, setShippingFee] = useState(120);

  // Validation / Loading States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const grandTotal = cartSubtotal + (cart.length > 0 ? shippingFee : 0);

  // Prefill city and address fields from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    
    const savedName = localStorage.getItem('fatpizza_user_name');
    const savedPhone = localStorage.getItem('fatpizza_user_phone');
    const savedEmail = localStorage.getItem('fatpizza_user_email');
    const savedWhatsapp = localStorage.getItem('fatpizza_user_whatsapp');
    const savedNote = localStorage.getItem('fatpizza_user_note');
    const savedChangeFor = localStorage.getItem('fatpizza_user_change_for');
    const savedFullAddress = localStorage.getItem('fatpizza_user_address_full');
    const savedCity = localStorage.getItem('fatpizza_user_city');
    const savedArea = localStorage.getItem('fatpizza_user_area');
    
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);
    if (savedEmail) setEmail(savedEmail);
    if (savedWhatsapp) setWhatsapp(savedWhatsapp);
    if (savedNote) setNote(savedNote);
    if (savedChangeFor) setChangeFor(savedChangeFor);
    if (savedCity) setCity(savedCity);

    if (savedFullAddress) {
      setAddress(savedFullAddress);
    } else if (savedArea) {
      setAddress(savedArea + ', ');
    }

    // Determine initial coordinates: first check if Cart page map selection exists
    const savedLat = localStorage.getItem('fatpizza_checkout_lat');
    const savedLng = localStorage.getItem('fatpizza_checkout_lng');
    const savedFee = localStorage.getItem('fatpizza_checkout_fee');
    const savedDist = localStorage.getItem('fatpizza_checkout_distance');

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
    
    if (savedDist && savedFee) {
      setDistance(parseFloat(savedDist));
      setShippingFee(parseInt(savedFee));
    } else {
      const dist = getDistanceFromLatLonInKm(RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lon, initialLat, initialLng);
      setDistance(dist);
      updateShippingFeeByDistance(dist);
    }
  }, []);

  // Update shipping fee dynamically based on location zones
  const updateShippingFeeByDistance = (distKm: number) => {
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
  };

  const validateForm = () => {
    if (name.trim().length < 3) {
      return t('Please enter your full name (At least 3 characters).', 'براہ کرم اپنا پورا نام درج کریں (کم از کم 3 حروف)۔');
    }
    
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    const phoneRegex = /^(03\d{9}|\+923\d{9})$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return t('Please enter a valid Pakistani mobile number (e.g. 03001234567).', 'براہ کرم درست پاکستانی موبائل نمبر درج کریں (مثال کے طور پر 03001234567)۔');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return t('Please enter a valid email address (e.g. customer@example.com).', 'براہ کرم درست ای میل پتہ درج کریں (مثال کے طور پر customer@example.com)۔');
    }

    if (address.trim().length < 10) {
      return t('Please enter your complete street address for accurate delivery.', 'براہ کرم درست ترسیل کے لیے اپنا پورا گلی/محلے کا پتہ درج کریں۔');
    }

    if (!city) {
      return t('Please select a delivery city.', 'براہ کرم ترسیل کا شہر منتخب کریں۔');
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate unique FP- prefix tracking code
      const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const trackingCode = `FP-${randStr}`;

      // 2. Prepare items
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        generic_name: item.generic_name,
        dosage: item.dosage,
        price_pkr: item.price_pkr,
        quantity: item.quantity,
        requires_prescription: false
      }));

      // Append coordinates, whatsapp, note, and change amount at the end of the address text
      const finalAddress = `${address.trim()} (Coords: ${markerPos.lat.toFixed(5)}, ${markerPos.lng.toFixed(5)})` +
        (whatsapp.trim() ? `\nWhatsApp: ${whatsapp.trim()}` : '') +
        (note.trim() ? `\nNote: ${note.trim()}` : '') +
        (changeFor.trim() ? `\nChange Required For: Rs. ${changeFor.trim()}` : '');

      // 3. Write to local backend orders API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          phone: phone.replace(/[\s-]/g, ''),
          email: email.trim(),
          address: finalAddress,
          city: city,
          items: orderItems,
          subtotal: cartSubtotal,
          shipping_fee: shippingFee,
          grand_total: grandTotal,
          total_amount: grandTotal,
          status: 'Pending',
          tracking_code: trackingCode
        })
      });
      
      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Failed to place order');
      }

      // Trigger email/SMS notifications
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'new_order',
            order: {
              tracking_code: trackingCode,
              customer_name: name.trim(),
              phone: phone.replace(/[\s-]/g, ''),
              email: email.trim(),
              address: finalAddress,
              city: city,
              items: orderItems,
              subtotal: cartSubtotal,
              shipping_fee: shippingFee,
              grand_total: grandTotal,
              status: 'Pending'
            }
          })
        });
      } catch (err) {
        console.error('Failed to send notification:', err);
      }

      // Save user details for autofill next time
      localStorage.setItem('fatpizza_user_name', name.trim());
      localStorage.setItem('fatpizza_user_phone', phone.replace(/[\s-]/g, ''));
      localStorage.setItem('fatpizza_user_whatsapp', whatsapp.replace(/[\s-]/g, ''));
      localStorage.setItem('fatpizza_user_note', note.trim());
      localStorage.setItem('fatpizza_user_change_for', changeFor.trim());
      localStorage.setItem('fatpizza_user_email', email.trim());
      localStorage.setItem('fatpizza_user_address_full', address.trim());
      localStorage.setItem('fatpizza_user_city', city);

      setIsSuccess(true);
      clearCart();
      router.push(`/confirmation?code=${trackingCode}`);

    } catch (e: any) {
      console.error('Error placing order:', e);
      setErrorMsg(e.message || t('Error processing your order. Please try again.', 'آرڈر پروسیس کرنے میں خرابی پیش آئی۔ دوبارہ کوشش کریں۔'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Multan', 'Peshawar', 'Quetta', 'Gujranwala', 'Sialkot', 
    'Hyderabad', 'Sargodha', 'Bahawalpur', 'Sukkur', 'Larkana'
  ];

  if (!isMounted) {
    return (
      <div className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('Securing checkout session...', 'سیشن لوڈ ہو رہا ہے...')}</p>
      </div>
    );
  }

  if (cart.length === 0 && !isSubmitting && !isSuccess) {
    let hasSavedItems = false;
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('medimart_cart');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            hasSavedItems = true;
          }
        }
      } catch (e) {}
    }

    if (hasSavedItems) {
      return (
        <div className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t('Loading checkout...', 'چیک آؤٹ لوڈ ہو رہا ہے...')}</p>
          <style jsx global>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px', fontFamily: 'var(--font-display)' }}>{t('Your Basket is Empty', 'کارٹ خالی ہے')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          {t('Please add some items to your basket before checking out.', 'چیک آؤٹ کرنے سے پہلے براہ کرم اپنے کارٹ میں کچھ چیزیں شامل کریں۔')}
        </p>
        <Link href="/shop" className="btn-primary" style={{ display: 'inline-flex', background: 'var(--primary)', color: 'white', textDecoration: 'none' }}>
          {t('Go to Menu', 'مینو پر جائیں')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      
      {/* Back to basket button */}
      <button 
        onClick={() => router.push('/cart')} 
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          marginBottom: '32px'
        }}
      >
        <ArrowLeft size={18} /> {t('Back to Basket', 'واپس کارٹ میں جائیں')}
      </button>

      {/* Main split grid */}
      <div className="responsive-tab-layout">
        
        {/* Left Side: Delivery Details Form */}
        <div className="responsive-tab-main">
          <div className="responsive-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '40px' }}>
            
            {/* Guest Checkout Banner */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.06)',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'start',
              gap: '14px',
              marginBottom: '30px'
            }}>
              <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ display: 'block', fontWeight: 900, fontSize: '0.92rem' }}>
                  {t('Fast Guest Checkout Active', 'بغیر لاگ ان آرڈر کی سہولت فعال')}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600, display: 'block', marginTop: '3px', lineHeight: '1.4' }}>
                  {t('No account registration or login required. Order instantly. Payment is only collected via Cash on Delivery.', 'اکاؤنٹ بنانے یا لاگ ان کرنے کی کوئی ضرورت نہیں۔ آرڈر فوری بک کریں۔ ادائیگی صرف ڈلیوری کے وقت نقد وصول کی جائے گی۔')}
                </span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              {t('Delivery Information', 'پتہ aur معلومات')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '30px' }}>
              {t('Enter accurate delivery details. Cash on Delivery is verified via Phone Call.', 'درست ڈیلیوری کی معلومات درج کریں۔ فون کال کے ذریعے کیش آن ڈیلیوری کی تصدیق کی جاتی ہے۔')}
            </p>

            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--status-cancelled)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: 600,
                lineHeight: 1.5,
                marginBottom: '30px'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Full Name */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {t('Full Name', 'خریدار کا نام')} <span style={{ color: 'red' }}>*</span>
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder={t('e.g. Muhammad Ali', 'مثال کے طور پر: محمد علی')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                  style={{ backgroundColor: 'transparent', color: 'var(--foreground)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              {/* Phone Number */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {t('Phone Number', 'موبائل نمبر')} <span style={{ color: 'red' }}>*</span>
                </label>
                <input 
                  type="tel" 
                  className="form-input"
                  placeholder={t('e.g. 03001234567', 'مثال کے طور پر: 03001234567')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                  required
                  style={{ backgroundColor: 'transparent', color: 'var(--foreground)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              {/* WhatsApp Number (Optional) */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {t('WhatsApp Number', 'واٹس ایپ نمبر')} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional / اختیاری)</span>
                </label>
                <input 
                  type="tel" 
                  className="form-input"
                  placeholder={t('Same as phone number if empty', 'موبائل نمبر جیسا')}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  disabled={isSubmitting}
                  style={{ backgroundColor: 'transparent', color: 'var(--foreground)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              {/* Email Address */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {t('Email Address', 'ای میل')} <span style={{ color: 'red' }}>*</span>
                </label>
                <input 
                  type="email" 
                  className="form-input"
                  placeholder={t('e.g. customer@example.com', 'مثال کے طور پر: customer@example.com')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  style={{ backgroundColor: 'transparent', color: 'var(--foreground)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              {/* City Selector */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {t('City', 'شہر')} <span style={{ color: 'red' }}>*</span>
                </label>
                <select 
                  className="form-input" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isSubmitting}
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', cursor: 'pointer', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  {cities.map((ct, idx) => (
                    <option key={idx} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>

              {/* Shipping Address */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {t('Complete Address', 'گھر کا پتہ')} <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea 
                  className="form-input"
                  rows={3}
                  placeholder={t('e.g. House # 42-B, Street 5, Phase 6, DHA', 'مثال کے طور پر: مکان نمبر 42-بی، گلی نمبر 5، فیز 6، ڈی ایچ اے')}
                  style={{ backgroundColor: 'transparent', color: 'var(--foreground)', resize: 'none', fontFamily: 'inherit', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Order Note */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {t('Order Note', 'آرڈر کی تفصیل / نوٹ')} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional / اختیاری)</span>
                </label>
                <textarea 
                  className="form-input"
                  rows={2}
                  placeholder={t('e.g. Extra spicy, ring the doorbell', 'مثال کے طور پر: زیادہ مصالحہ، گھنٹی بجائیں')}
                  style={{ backgroundColor: 'transparent', color: 'var(--foreground)', resize: 'none', fontFamily: 'inherit', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Cash Change Required */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {t('Bring Change For (Rs.)', 'کتنے روپے کا کھلا لانا ہے؟')} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional / اختیاری)</span>
                </label>
                <input 
                  type="number" 
                  className="form-input"
                  placeholder={t('e.g. 5000', 'مثال کے طور پر: 5000')}
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                  disabled={isSubmitting}
                  style={{ backgroundColor: 'transparent', color: 'var(--foreground)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>


              {/* Dynamic Distance Details (Read-only from Cart) */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                padding: '16px', 
                background: 'var(--background)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <MapPin size={18} color="var(--primary)" /> 
                  <span style={{ fontWeight: 900, fontSize: '0.88rem', color: 'var(--foreground)' }}>
                    {t('Location Synced from Cart', 'کارٹ سے لوکیشن سنک ہو گئی')}
                  </span>
                </div>

                {distance !== null && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px', 
                    marginTop: '4px',
                    fontSize: '0.78rem',
                    background: 'var(--background)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t('Kitchen Distance:', 'کچن سے فاصلہ:')}</span>
                      <span style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', color: 'var(--foreground)', marginTop: '2px' }}>
                        {distance.toFixed(2)} km
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t('Estimated Delivery Time:', 'اندازہ وقت ترسیل:')}</span>
                      <span style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', color: 'var(--foreground)', marginTop: '2px' }}>
                        {distance <= 1 ? '10 - 20 mins' : distance <= 3 ? '15 - 25 mins' : distance <= 6 ? '25 - 35 mins' : distance <= 12 ? '35 - 50 mins' : '50 - 75 mins'}
                      </span>
                    </div>
                    
                    {distance > 15 && (
                      <div style={{
                        gridColumn: 'span 2',
                        background: 'rgba(239, 68, 68, 0.06)',
                        color: 'var(--status-cancelled)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        lineHeight: '1.4',
                        fontWeight: 700
                      }}>
                        ⚠️ {t('Warning: You are very far from our kitchen (over 15km). Delivery times may vary.', 'انتباہ: آپ ہمارے باورچی خانے سے کافی دور ہیں (15 کلومیٹر سے زیادہ)۔ ڈلیوری کا وقت تبدیل ہو سکتا ہے۔')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* COD Disclaimer */}
              <div style={{
                background: 'var(--background)',
                border: '1px solid var(--border-color)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                marginTop: '8px'
              }}>
                <Truck size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '4px' }}>{t('Cash on Delivery Only', 'صرف کیش آن ڈلیوری')}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {t('Pay safely at your doorstep once your food is delivered hot and fresh. No advance banking details needed.', 'جب آپ کا کھانا گرم اور تازہ پہنچایا جائے تو دہلیز پر محفوظ طریقے سے ادائیگی کریں۔ پیشگی بینکنگ تفصیلات کی ضرورت نہیں ہے۔')}
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '16px 24px', justifyContent: 'center', fontSize: '1.05rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, borderRadius: 'var(--radius-sm)', marginTop: '8px' }}
              >
                {isSubmitting ? t('Processing Order...', 'آرڈر جا رہا ہے...') : t('Confirm Order', 'آرڈر کنفرم کریں')}
              </button>

            </form>
          </div>
        </div>

        {/* Right Side: Basket summary */}
        <div className="responsive-tab-sidebar">
          <div className="responsive-card summary-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={18} color="var(--primary)" /> {t('Basket Summary', 'آرڈر کی تفصیل')} ({cart.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', maxHeight: '240px', overflowY: 'auto' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ maxWidth: '75%' }}>
                    <span style={{ fontWeight: 800 }}>{t(item.name)}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>x{item.quantity}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t(item.dosage)}</div>
                  </div>
                  <span style={{ fontWeight: 800 }}>Rs. {item.price_pkr * item.quantity}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '20px' }} />

            {/* Billing details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('Basket Subtotal:', 'ٹوٹل قیمت:')}</span>
                <span style={{ fontWeight: 700 }}>Rs. {cartSubtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('Delivery Fee:', 'ڈلیوری فیس:')}</span>
                <span style={{ fontWeight: 700 }}>
                  Rs. {shippingFee}
                  {distance !== null && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textAlign: 'right', fontWeight: 600 }}>
                      ({distance.toFixed(1)} km distance)
                    </span>
                  )}
                </span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                <span style={{ fontWeight: 900 }}>{t('Total Order Value:', 'کل واجب الادا رقم:')}</span>
                <span style={{ fontWeight: 900, color: 'var(--primary)' }}>Rs. {grandTotal}</span>
              </div>
            </div>

            <div style={{
              background: 'var(--primary-bg)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={14} /> {t('Fatpizza Kitchen Approved', 'فیٹ پیزا کچن سے منظور شدہ')}
            </div>

          </div>
        </div>

      </div>

      {/* Loader screen */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid var(--border-color)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '8px' }}>
              {t('Placing Your Order...', 'آرڈر پروسیس ہو رہا ہے...')}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {t('Cooking in progress. Please do not close or refresh this page.', 'تیاری جاری ہے۔ براہ کرم اس صفحہ کو بند یا ریفریش نہ کریں۔')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
