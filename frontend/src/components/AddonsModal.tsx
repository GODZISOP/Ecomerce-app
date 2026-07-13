import React, { useState, useEffect } from 'react';
import { X, Loader2, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useCart, Addon } from '@/context/CartContext';
import { PizzaItem } from '@/lib/supabaseClient';
import { useLanguage } from '@/context/LanguageContext';

interface AddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: PizzaItem | null;
  initialQuantity?: number;
}

export default function AddonsModal({ isOpen, onClose, medicine, initialQuantity = 1 }: AddonsModalProps) {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
      setSelectedAddons([]);
      fetchAddons();
    }
  }, [isOpen, initialQuantity]);

  const fetchAddons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('addons').select('*').order('name');
      if (data) {
        setAddons(data);
      }
    } catch (e) {
      console.error('Error fetching addons:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleAddToCart = () => {
    if (!medicine) return;
    setIsAdding(true);
    // Add to cart context
    addToCart(medicine as any, quantity, selectedAddons);
    
    // Simulate slight delay for better UX
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 400);
  };

  if (!isOpen || !medicine) return null;

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price_pkr, 0);
  const totalItemPrice = (medicine.price_pkr + addonsTotal) * quantity;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--card-bg)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('Customize Item', 'آئٹم کو اپنی مرضی کے مطابق بنائیں')}</h2>
          <button onClick={onClose} style={{ background: 'var(--background)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="var(--foreground)" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Product Info */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <img src={medicine.image_url} alt={medicine.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>{t(medicine.name)}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{t(medicine.generic_name)}</p>
              <div style={{ fontWeight: 900, color: 'var(--primary)' }}>Rs. {medicine.price_pkr}</div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            {t('Add-ons & Extras', 'اضافی اشیاء')}
          </h3>

          {isLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Loader2 size={24} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : addons.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
              {t('No add-ons available.', 'کوئی اضافی اشیاء دستیاب نہیں ہیں۔')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {addons.map(addon => {
                const isSelected = selectedAddons.some(a => a.id === addon.id);
                return (
                  <label key={addon.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--primary-bg)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleAddon(addon)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{addon.name}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>+Rs. {addon.price_pkr}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Quantity */}
          <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--background)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontWeight: 800 }}>{t('Quantity', 'تعداد')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '32px', height: '32px', border: '1px solid var(--border-color)', borderRadius: '50%', background: 'var(--card-bg)', cursor: 'pointer', fontWeight: 800 }}>-</button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ width: '32px', height: '32px', border: '1px solid var(--border-color)', borderRadius: '50%', background: 'var(--card-bg)', cursor: 'pointer', fontWeight: 800 }}>+</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={handleAddToCart}
            disabled={isAdding}
            style={{
              width: '100%',
              padding: '16px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            {isAdding ? (
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <ShoppingBag size={20} />
                {t('Add to Cart', 'کارٹ میں شامل کریں')} - Rs. {totalItemPrice}
              </>
            )}
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
