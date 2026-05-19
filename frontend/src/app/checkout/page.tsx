'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, ArrowLeft, ClipboardList, Activity } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabaseClient';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useCart();

  const shippingFee = cart.length > 0 ? 150 : 0;
  const grandTotal = cartSubtotal + shippingFee;

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Karachi');
  
  // Validation / Loading States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (isSuccess) return;

    // If cart is empty, redirect back to cart
    if (cart.length === 0 && !isSubmitting) {
      router.push('/cart');
    }
  }, [cart, router, isSubmitting, isMounted, isSuccess]);

  const validateForm = () => {
    if (name.trim().length < 3) {
      return 'Baraye meherbani apna mukammal naam darj karein (At least 3 characters). / نام مکمل درج کریں۔';
    }
    
    // Pakistani Phone regex: starts with 03 or +923, total 11 or 12 digits
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    const phoneRegex = /^(03\d{9}|\+923\d{9})$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return 'Munasib Pakistani phone number darj karein (e.g. 03001234567). / موبائل نمبر درست درج کریں۔';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Munasib email address darj karein (e.g. ali@gmail.com) taake tracking code mil sake. / ای میل درست درج کریں۔';
    }

    if (address.trim().length < 10) {
      return 'Mukammal pata (Address) darj karein taake delivery me masla na ho (At least 10 characters). / مکمل پتہ درج کریں۔';
    }

    if (!city) {
      return 'City muntakhib karein. / شہر منتخب کریں۔';
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
      // 1. Generate unique 6-digit uppercase alphanumeric tracking code
      const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const trackingCode = `MM-${randStr}`;

      // 2. Prepare items JSON array
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        generic_name: item.generic_name,
        dosage: item.dosage,
        price_pkr: item.price_pkr,
        quantity: item.quantity,
        requires_prescription: item.requires_prescription
      }));

      // 3. Write to Supabase orders table
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: name.trim(),
            phone: phone.replace(/[\s-]/g, ''),
            email: email.trim(),
            address: address.trim(),
            city: city,
            items: orderItems,
            subtotal: cartSubtotal,
            shipping_fee: shippingFee,
            grand_total: grandTotal,
            total_amount: grandTotal,
            status: 'Pending',
            tracking_code: trackingCode
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      // Trigger email notifications (Admin alert & Customer confirmation)
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
              address: address.trim(),
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
        console.error('Failed to send notification email:', err);
      }

      // 4. Order created successfully! Clear checkout session state and cart
      setIsSuccess(true);
      clearCart();

      // 5. Redirect to confirmation page with tracking code
      router.push(`/confirmation?code=${trackingCode}`);

    } catch (e: any) {
      console.error('Error placing order:', e);
      setErrorMsg(e.message || 'Order place karte waqt error pesh aya. Dobara koshish karein.');
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
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Securing checkout session / لوڈ ہو رہا ہے...</p>
      </div>
    );
  }

  if (cart.length === 0 && !isSubmitting && !isSuccess) {
    return null;
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
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          marginBottom: '32px'
        }}
      >
        <ArrowLeft size={18} /> Back to Basket / واپس جائیں
      </button>

      {/* Main split grid */}
      <div className="responsive-tab-layout">
        
        {/* Left Side: Delivery Details Form */}
        <div className="responsive-tab-main">
          <div className="responsive-card">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
              Delivery Information / پتہ اور معلومات
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '30px' }}>
              Enter accurate delivery details. Cash on Delivery is verified via Phone Call.
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

            <form onSubmit={handleSubmit}>
              
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">
                  <span>Full Name / خریدار کا نام <span style={{ color: 'red' }}>*</span></span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>As on CNIC</span>
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Muhammad Ali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label">
                  <span>Phone Number / موبائل نمبر <span style={{ color: 'red' }}>*</span></span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>For Call Verification</span>
                </label>
                <input 
                  type="tel" 
                  className="form-input"
                  placeholder="e.g. 03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">
                  <span>Email Address / ای میل <span style={{ color: 'red' }}>*</span></span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>To Receive Tracking Info</span>
                </label>
                <input 
                  type="email" 
                  className="form-input"
                  placeholder="e.g. customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Shipping Address */}
              <div className="form-group">
                <label className="form-label">
                  <span>Complete Address / گھر کا پتہ <span style={{ color: 'red' }}>*</span></span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Street, House #, Block/Sector</span>
                </label>
                <textarea 
                  className="form-input"
                  rows={4}
                  placeholder="e.g. House # 42-B, Street 5, Phase 6, DHA"
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* City Selector */}
              <div className="form-group">
                <label className="form-label">
                  <span>City / شہر <span style={{ color: 'red' }}>*</span></span>
                </label>
                <select 
                  className="form-input" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isSubmitting}
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                  {cities.map((ct, idx) => (
                    <option key={idx} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>

              {/* COD Disclaimer Banner */}
              <div style={{
                background: 'var(--background)',
                border: '1px solid var(--border-color)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                marginBottom: '32px'
              }}>
                <Truck size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>Cash on Delivery Only (کیش آن ڈلیوری)</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Pay safely at your doorstep once your package is successfully delivered. We do not require any online bank account transfers.
                  </p>
                </div>
              </div>

              {/* Place Order submit */}
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '16px 24px', justifyContent: 'center', fontSize: '1.05rem' }}
              >
                {isSubmitting ? 'Processing Order / آرڈر جا رہا ہے...' : 'Place Cash on Delivery Order / آرڈر کنفرم کریں'}
              </button>

            </form>
          </div>
        </div>

        {/* Right Side: Quick order summary breakdown */}
        <div className="responsive-tab-sidebar">
          <div className="responsive-card summary-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={18} color="var(--primary)" /> Basket Summary ({cart.length})
            </h3>

            {/* List items briefly */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ maxWidth: '70%' }}>
                    <span style={{ fontWeight: 700 }}>{item.name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>x{item.quantity}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.dosage}</div>
                  </div>
                  <span style={{ fontWeight: 700 }}>Rs. {item.price_pkr * item.quantity}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '20px' }} />

            {/* Billing figures */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Basket Subtotal:</span>
                <span style={{ fontWeight: 600 }}>Rs. {cartSubtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping Fee:</span>
                <span style={{ fontWeight: 600 }}>Rs. {shippingFee}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem' }}>
                <span style={{ fontWeight: 800 }}>Total Order Value:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Rs. {grandTotal}</span>
              </div>
            </div>

            {/* Trust badge */}
            <div style={{
              background: 'var(--primary-bg)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={14} /> Registered Medical Supplier Verified
            </div>

          </div>
        </div>

      </div>

      {/* Fullscreen premium glassmorphic loader overlay */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px'
        }}>
          <div className="spinner" style={{
            width: '60px',
            height: '60px',
            border: '4px solid var(--border-color)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
          }} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '8px' }}>
              Placing Your Order / آرڈر پروسیس ہو رہا ہے
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Baraye meherbani intezar karein. Please do not refresh or close this page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
