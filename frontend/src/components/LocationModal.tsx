'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const CITIES_DATA: { [key: string]: string[] } = {
  'Karachi': [
    'DHA / Defence',
    'Clifton',
    'Gulshan-e-Iqbal',
    'Gulistan-e-Jauhar',
    'PECHS',
    'Saddar',
    'North Nazimabad',
    'Bahadurabad',
    'Karsaz',
    'Federal B Area',
    'Karachi University Emp C.H.S'
  ],
  'Lahore': [
    'Gulberg',
    'DHA Lahore',
    'Johar Town',
    'Model Town',
    'Faisal Town'
  ],
  'Islamabad': [
    'Sector F-6',
    'Sector F-7',
    'Sector G-11',
    'Sector I-8',
    'DHA Islamabad'
  ]
};

export default function LocationModal() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedCity, setSelectedCity] = useState<string>('Karachi');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Run auto-fetch location on open
  useEffect(() => {
    if (isOpen) {
      handleGetCurrentLocation();
    }
  }, [isOpen]);

  const handleGetCurrentLocation = (isManual: boolean = false) => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            if (!response.ok) throw new Error("HTTP error " + response.status);
            const data = await response.json();
            
            let matchedCity = 'Karachi';
            let matchedArea = '';

            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.state || '';
              const suburb = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.commercial || '';
              
              if (city.toLowerCase().includes('lahore')) {
                matchedCity = 'Lahore';
              } else if (city.toLowerCase().includes('islamabad')) {
                matchedCity = 'Islamabad';
              }

              const areas = CITIES_DATA[matchedCity] || [];
              if (suburb) {
                matchedArea = areas.find(area => 
                  area.toLowerCase().replace(/[^a-z0-9]/g, '').includes(suburb.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
                  suburb.toLowerCase().replace(/[^a-z0-9]/g, '').includes(area.toLowerCase().replace(/[^a-z0-9]/g, ''))
                ) || '';
              }

              if (!matchedArea && areas.length > 0) {
                matchedArea = areas[0];
              }
            } else {
              matchedArea = CITIES_DATA[matchedCity]?.[0] || '';
            }

            setSelectedCity(matchedCity);
            setSelectedArea(matchedArea);
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            // Robust fallback so they are never stuck
            setSelectedCity('Karachi');
            setSelectedArea('Karachi University Emp C.H.S');
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoading(false);
          // Fallback to default city/area so the user can easily proceed
          setSelectedCity('Karachi');
          setSelectedArea('Karachi University Emp C.H.S');
          
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
                errorMsg = t('Location request timed out.', 'لوکیشن حاصل کرنے کا وقت ختم ہو گیا۔');
                break;
              default:
                errorMsg = error.message;
            }
            alert(`${t('GPS Alert:', 'لوکیشن الرٹ:')} ${errorMsg}\n\n${t('Defaulting to Karachi.', 'کراچی کی ڈیفالٹ لوکیشن منتخب کی جا رہی ہے۔')}`);
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
      );
    } else {
      setSelectedCity('Karachi');
      setSelectedArea('Karachi University Emp C.H.S');
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
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#f1f3f6',
            color: '#1a1a1a',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '28px',
            transition: 'background 0.2s ease',
            width: '100%',
            maxWidth: '240px',
            boxSizing: 'border-box'
          }}
        >
          <Navigation size={16} style={{ transform: 'rotate(45deg)' }} />
          {isLoading ? t('Fetching...', 'حاصل کیا جا رہا ہے...') : t('Use Current Location', 'موجودہ لوکیشن استعمال کریں')}
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
                  {t('Select Area', 'علاقہ منتخب کریں')}
                </option>
                {(CITIES_DATA[selectedCity] || []).map((area) => (
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
