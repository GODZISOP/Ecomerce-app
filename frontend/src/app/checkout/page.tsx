'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, ArrowLeft, ClipboardList } from 'lucide-react';
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

    if (cart.length === 0 && !isSubmitting) {
      router.push('/cart');
    }
  }, [cart, router, isSubmitting, isMounted, isSuccess]);

  const validateForm = () => {
    if (name.trim().length < 3) {
      return 'Please enter your full name (At least 3 characters). / نام درج کریں۔';
    }
    
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    const phoneRegex = /^(03\d{9}|\+923\d{9})$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return 'Please enter a valid Pakistani mobile number (e.g. 03001234567). / موبائل نمبر درست درج کریں۔';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address (e.g. customer@example.com). / ای میل درست درج کریں۔';
    }

    if (address.trim().length < 10) {
      return 'Please enter your complete street address for accurate delivery. / پتہ درج کریں۔';
    }

    if (!city) {
      return 'Please select a delivery city. / شہر منتخب کریں۔';
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

      // 3. Write to Supabase orders table
      const { error } = await supabase
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

      // Trigger email notifications
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

      setIsSuccess(true);
      clearCart();
      router.push(`/confirmation?code=${trackingCode}`);

    } catch (e: any) {
      console.error('Error placing order:', e);
      setErrorMsg(e.message || 'Error processing your order. Please try again.');
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
          fontWeight: 800,
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
      <div className="responsive-tab-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '40px' }}>
        
        {/* Left Side: Delivery Details Form */}
        <div className="responsive-tab-main">
          <div className="responsive-card" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Full Name */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  Full Name / خریدار کا نام <span style={{ color: 'red' }}>*</span>
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Muhammad Ali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                  style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              {/* Phone Number */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  Phone Number / موبائل نمبر <span style={{ color: 'red' }}>*</span>
                </label>
                <input 
                  type="tel" 
                  className="form-input"
                  placeholder="e.g. 03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                  required
                  style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              {/* Email Address */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  Email Address / ای میل <span style={{ color: 'red' }}>*</span>
                </label>
                <input 
                  type="email" 
                  className="form-input"
                  placeholder="e.g. customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              {/* Shipping Address */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  Complete Address / گھر کا پتہ <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea 
                  className="form-input"
                  rows={4}
                  placeholder="e.g. House # 42-B, Street 5, Phase 6, DHA"
                  style={{ resize: 'none', fontFamily: 'inherit', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* City Selector */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  City / شہر <span style={{ color: 'red' }}>*</span>
                </label>
                <select 
                  className="form-input" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isSubmitting}
                  style={{ cursor: 'pointer', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  {cities.map((ct, idx) => (
                    <option key={idx} value={ct}>{ct}</option>
                  ))}
                </select>
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
                marginBottom: '12px',
                marginTop: '12px'
              }}>
                <Truck size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '4px' }}>Cash on Delivery Only (کیش آن ڈلیوری)</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Pay safely at your doorstep once your food is delivered hot and fresh. No advance banking details needed.
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', padding: '16px 24px', justifyContent: 'center', fontSize: '1.05rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, borderRadius: 'var(--radius-sm)' }}
              >
                {isSubmitting ? 'Processing Order...' : 'Confirm Order / آرڈر کنفرم کریں'}
              </button>

            </form>
          </div>
        </div>

        {/* Right Side: Basket summary */}
        <div className="responsive-tab-sidebar">
          <div className="responsive-card summary-card" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={18} color="var(--primary)" /> Basket Summary ({cart.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', maxHeight: '240px', overflowY: 'auto' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ maxWidth: '75%' }}>
                    <span style={{ fontWeight: 800 }}>{item.name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>x{item.quantity}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.dosage}</div>
                  </div>
                  <span style={{ fontWeight: 800 }}>Rs. {item.price_pkr * item.quantity}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '20px' }} />

            {/* Billing details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Basket Subtotal:</span>
                <span style={{ fontWeight: 700 }}>Rs. {cartSubtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Fee:</span>
                <span style={{ fontWeight: 700 }}>Rs. {shippingFee}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                <span style={{ fontWeight: 900 }}>Total Order Value:</span>
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
              <ShieldCheck size={14} /> Fatpizza Kitchen Approved
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
          background: 'rgba(255, 255, 255, 0.85)',
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
              Placing Your Order / آرڈر پروسیس ہو رہا ہے
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Cooking in progress. Please do not close or refresh this page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
