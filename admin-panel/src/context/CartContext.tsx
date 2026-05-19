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

export interface CartItem extends Medicine {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (medicine: Medicine, quantity?: number) => void;
  removeFromCart: (medicineId: number) => void;
  updateCartQty: (medicineId: number, quantity: number) => void;
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

  const addToCart = (medicine: Medicine, quantity: number = 1) => {
    const existingItemIndex = cart.findIndex((item) => item.id === medicine.id);
    let newCart = [...cart];

    if (existingItemIndex > -1) {
      const newQty = newCart[existingItemIndex].quantity + quantity;
      newCart[existingItemIndex].quantity = Math.min(newQty, medicine.stock);
    } else {
      newCart.push({ ...medicine, quantity: Math.min(quantity, medicine.stock) });
    }

    saveCart(newCart);
  };

  const removeFromCart = (medicineId: number) => {
    const newCart = cart.filter((item) => item.id !== medicineId);
    saveCart(newCart);
  };

  const updateCartQty = (medicineId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const newCart = cart.map((item) => {
      if (item.id === medicineId) {
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
  const cartSubtotal = cart.reduce((total, item) => total + item.price_pkr * item.quantity, 0);

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
