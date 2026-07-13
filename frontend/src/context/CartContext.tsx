'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  category: string;
  price_pkr: number;
  stock: number;
  dosage: string;
  description: string;
  manufacturer: string;
  requires_prescription: boolean;
  image_url: string;
}

export interface Addon {
  id: number;
  name: string;
  price_pkr: number;
}

export interface CartItem extends Medicine {
  cartItemId: string;
  quantity: number;
  addons?: Addon[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (medicine: Medicine, quantity?: number, addons?: Addon[]) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQty: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('medimart_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart data from localStorage', e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('medimart_cart', JSON.stringify(newCart));
  };

  const addToCart = (medicine: Medicine, quantity: number = 1, addons: Addon[] = []) => {
    // Generate a unique ID based on the medicine ID and sorted addon IDs
    const addonIds = addons.map(a => a.id).sort().join('-');
    const cartItemId = `${medicine.id}-${addonIds}`;

    const existingItemIndex = cart.findIndex((item) => item.cartItemId === cartItemId);
    let newCart = [...cart];

    if (existingItemIndex > -1) {
      const newQty = newCart[existingItemIndex].quantity + quantity;
      newCart[existingItemIndex].quantity = Math.min(newQty, medicine.stock);
    } else {
      newCart.push({ ...medicine, cartItemId, quantity: Math.min(quantity, medicine.stock), addons });
    }

    saveCart(newCart);
  };

  const removeFromCart = (cartItemId: string) => {
    const newCart = cart.filter((item) => item.cartItemId !== cartItemId);
    saveCart(newCart);
  };

  const updateCartQty = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const newCart = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        return { ...item, quantity: Math.min(quantity, item.stock) };
      }
      return item;
    });

    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => {
    const addonsTotal = (item.addons || []).reduce((sum, addon) => sum + addon.price_pkr, 0);
    return total + ((item.price_pkr + addonsTotal) * item.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
