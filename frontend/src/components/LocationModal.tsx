'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// Restaurant's exact center coordinates (Update these to your exact shop/kitchen coordinates)
const RESTAURANT_COORDS = { lat: 24.96388, lon: 67.12789 }; 
const MAX_DELIVERY_RADIUS_KM = 6;

// Function to calculate distance in km using Haversine formula
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

// These are the manually allowed areas. Users can only select these manually.
// Because we only deliver within 6km, we restrict the dropdown to nearby areas.
const CITIES_DATA: { [key: string]: string[] } = {
  'Karachi': [
    'Gulshan-e-Iqbal',
    'Gulistan-e-Jauhar',
    'Scheme 33',
    'Teachers Society',
    'PCSIR Society',
    'Madras Chowk',
    'Shaaz Bungalows',
    'Safoora Chowk',
    'Khatm-e-Nabuwat Chowk',
    'Mosamiyat',
    'Kamran Chowrangi',
    'Munawwar Chowrangi',
    'Pehlwan Goth',
    'Rabia City',
    'Darul Sehat',
    'Abul Hasan Isphahani Road',
    'Nipa Chowrangi',
    'Suparco Road',
    'Dow University Ojha Campus',
    'Saadi Town',
    'Rim Jhim Towers',
    'Chapal Sun City',
    'Karachi University Emp C.H.S',
    'Federal B Area',
    'Malir',
    'Malir Cantt'
  ]
};

export default function LocationModal() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedCity, setSelectedCity] = useState<string>('Karachi');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  useEffect(() => {
    // Check if location is already set
    const savedLocation = localStorage.getItem('fatpizza_location_verified');
    if (!savedLocation) {
      setTimeout(() => setIsOpen(true), 1200);
    }

    const handleOpen = () => {
      // Load saved values if they exist when opening
      const savedCity = localStorage.getItem('fatpizza_user_city');
      const savedArea = localStorage.getItem('fatpizza_user_area');
      const savedType = localStorage.getItem('fatpizza_order_type') as any;
      if (savedCity) setSelectedCity(savedCity);
      if (savedArea) setSelectedArea(savedArea);
      if (savedType) setOrderType(savedType);
      setIsOpen(true);
    };

    window.addEventListener('open-location-modal', handleOpen);
    return () => {
      window.removeEventListener('open-location-modal', handleOpen);
    };
  }, []);

  const handleGetCurrentLocation = (isManual: boolean = false) => {
    console.log("[Location] handleGetCurrentLocation started. isManual:", isManual);
    if (navigator.geolocation) {
      console.log("[Location] navigator.geolocation is available. Requesting position...");
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log(`[Location] GPS Position received: Lat=${latitude}, Lon=${longitude}`);
          
          const distance = getDistanceFromLatLonInKm(
            RESTAURANT_COORDS.lat, 
            RESTAURANT_COORDS.lon, 
            latitude, 
            longitude
          );
          
          console.log(`[Location] Distance from restaurant: ${distance.toFixed(2)} km`);

          if (distance <= MAX_DELIVERY_RADIUS_KM) {
            console.log(`[Location] Success! User is within delivery radius (${distance.toFixed(2)} km)`);
            // Automatically select the nearest supported area from our list for the UI
            setSelectedCity('Karachi');
            setSelectedArea('Gulshan-e-Iqbal'); // Defaulting to the central hub for the UI selection
            
            setFetchSuccess(true);
            setTimeout(() => setFetchSuccess(false), 3000);
          } else {
            console.log(`[Location] Failed! User is outside delivery radius (${distance.toFixed(2)} km)`);
            if (isManual) {
              alert(t(`Sorry, we do not deliver to this area. You are ${distance.toFixed(1)} km away (Max 6km).`, `معذرت، ہم اس علاقے میں ڈلیوری نہیں کرتے۔ آپ کا فاصلہ ${distance.toFixed(1)} کلومیٹر ہے۔`));
            }
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("[Location] Geolocation error received:", error);
          setIsLoading(false);
          
          if (isManual) {
            let errorMsg = '';
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMsg = t('Location permission denied by browser settings. Please allow location access.', 'براؤزر سیٹنگز میں لوکیشن کی اجازت نہیں دی گئی۔ براہ کرم لوکیشن کی اجازت دیں۔');
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg = t('Location information is unavailable on this device.', 'اس ڈیوائس پر لوکیشن کی معلومات دستیاب نہیں ہیں۔');
                break;
              case error.TIMEOUT:
                errorMsg = t('Location request timed out. Please enter your location manually.', 'لوکیشن حاصل کرنے کا وقت ختم ہو گیا۔ براہ کرم مینوئل لوکیشن درج کریں۔');
                break;
              default:
                errorMsg = error.message;
            }
            alert(`${t('GPS Alert:', 'لوکیشن الرٹ:')} ${errorMsg}`);
          }
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
      );
    } else {
      if (isManual) {
        alert(t('Geolocation is not supported by your browser.', 'آپ کا براؤزر جیو لوکیشن کو سپورٹ نہیں کرتا۔'));
      }
    }
  };

  const handleConfirmLocation = () => {
    if (selectedCity && selectedArea) {
      localStorage.setItem('fatpizza_location_verified', 'true');
      localStorage.setItem('fatpizza_user_city', selectedCity);
      localStorage.setItem('fatpizza_user_area', selectedArea);
      localStorage.setItem('fatpizza_order_type', orderType);
      window.dispatchEvent(new Event('location-updated'));
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.55)',
      backdropFilter: 'blur(6px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '35px 30px',
        position: 'relative',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Logo Container */}
        <div style={{
          width: '90px',
          height: '90px',
          background: '#f13c0b',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 8px 16px rgba(241, 60, 11, 0.2)'
        }}>
          <span style={{
            color: '#ffffff',
            fontSize: '1.4rem',
            fontWeight: 900,
            lineHeight: '1.1',
            letterSpacing: '-0.5px'
          }}>Fat</span>
          <span style={{
            color: '#ffffff',
            fontSize: '1.4rem',
            fontWeight: 900,
            lineHeight: '1.1',
            letterSpacing: '-0.5px'
          }}>pizza</span>
        </div>

        {/* Section 1: Order Type */}
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: '#1a1a1a',
          margin: '0 0 16px 0',
          textAlign: 'center'
        }}>
          {t('Select your order type', 'آرڈر کی قسم منتخب کریں')}
        </h3>

        <div style={{
          display: 'flex',
          width: '100%',
          background: '#f5f5f7',
          padding: '4px',
          borderRadius: '30px',
          marginBottom: '28px',
          boxSizing: 'border-box'
        }}>
          <button
            onClick={() => setOrderType('delivery')}
            style={{
              flex: 1,
              background: orderType === 'delivery' ? '#f13c0b' : 'transparent',
              color: orderType === 'delivery' ? '#ffffff' : '#555555',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '26px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: orderType === 'delivery' ? '0 4px 10px rgba(241, 60, 11, 0.25)' : 'none'
            }}
          >
            {t('Delivery', 'ڈلیوری')}
          </button>
          <button
            onClick={() => setOrderType('pickup')}
            style={{
              flex: 1,
              background: orderType === 'pickup' ? '#f13c0b' : 'transparent',
              color: orderType === 'pickup' ? '#ffffff' : '#555555',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '26px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: orderType === 'pickup' ? '0 4px 10px rgba(241, 60, 11, 0.25)' : 'none'
            }}
          >
            {t('Pick-Up', 'پک اپ')}
          </button>
        </div>

        {/* Section 2: Location Selection */}
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: '#1a1a1a',
          margin: '0 0 16px 0',
          textAlign: 'center'
        }}>
          {t('Please select your location', 'براہ کرم اپنی لوکیشن منتخب کریں')}
        </h3>

        {/* Use Current Location Button */}
        <button
          onClick={() => handleGetCurrentLocation(true)}
          disabled={isLoading || fetchSuccess}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: fetchSuccess ? '#e8f5e9' : '#f1f3f6',
            color: fetchSuccess ? '#2e7d32' : '#1a1a1a',
            border: fetchSuccess ? '1px solid #c8e6c9' : 'none',
            padding: '12px 24px',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: (isLoading || fetchSuccess) ? 'default' : 'pointer',
            marginBottom: '28px',
            transition: 'all 0.3s ease',
            width: '100%',
            maxWidth: '260px',
            boxSizing: 'border-box'
          }}
        >
          {fetchSuccess ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {t('Location Fetched!', 'لوکیشن مل گئی!')}
            </>
          ) : (
            <>
              <Navigation size={16} style={{ transform: 'rotate(45deg)' }} />
              {isLoading ? t('Fetching...', 'حاصل کیا جا رہا ہے...') : t('Use Current Location', 'موجودہ لوکیشن استعمال کریں')}
            </>
          )}
        </button>

        {/* Dropdowns */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          {/* City / Region */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#555555' }}>
              {t('Select City / Region', 'شہر / علاقہ منتخب کریں')}
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  const areas = CITIES_DATA[e.target.value] || [];
                  setSelectedArea(areas[0] || '');
                }}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  background: '#ffffff',
                  fontSize: '0.95rem',
                  color: '#1a1a1a',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  boxSizing: 'border-box'
                }}
              >
                {Object.keys(CITIES_DATA).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                style={{
                  position: 'absolute',
                  right: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#777777',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>

          {/* Area / Sub Region */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#555555' }}>
              {t('Select Area / Sub Region', 'ذیلی علاقہ منتخب کریں')}
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  background: '#ffffff',
                  fontSize: '0.95rem',
                  color: '#1a1a1a',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  boxSizing: 'border-box'
                }}
              >
                <option value="" disabled>
                  {t('Select Areas', 'علاقہ منتخب کریں')}
                </option>
                {Array.from(new Set([...(CITIES_DATA[selectedCity] || []), ...(selectedArea ? [selectedArea] : [])])).map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                style={{
                  position: 'absolute',
                  right: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#777777',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirmLocation}
          disabled={!selectedArea}
          style={{
            width: '100%',
            background: selectedArea ? '#f13c0b' : '#cccccc',
            color: '#ffffff',
            border: 'none',
            padding: '16px',
            borderRadius: '16px',
            fontSize: '1.05rem',
            fontWeight: 800,
            cursor: selectedArea ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s ease',
            boxShadow: selectedArea ? '0 8px 20px rgba(241, 60, 11, 0.25)' : 'none',
            boxSizing: 'border-box'
          }}
        >
          {t('Select', 'منتخب کریں')}
        </button>
      </div>
    </div>
  );
}
