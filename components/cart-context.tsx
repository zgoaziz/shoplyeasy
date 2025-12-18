"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  cartItemId?: string; // Identifiant unique pour le panier (id + size + color)
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity" | "cartItemId">) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, "quantity" | "cartItemId">) => {
    setItems((prev) => {
      // Créer un identifiant unique pour cet item (basé sur id + size + color)
      const cartItemId = `${item.id}-${item.size || ''}-${item.color || ''}`
      
      // Vérifier si un produit avec le même cartItemId existe
      const found = prev.find((i) => i.cartItemId === cartItemId);
      if (found) {
        return prev.map((i) =>
          i.cartItemId === cartItemId 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      }
      return [...prev, { ...item, quantity: 1, cartItemId }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}