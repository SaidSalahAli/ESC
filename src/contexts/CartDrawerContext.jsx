import React, { createContext, useContext, useState } from 'react';

// ==============================|| CART DRAWER CONTEXT ||============================== //

const CartDrawerContext = createContext();

export function CartDrawerProvider({ children }) {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const openCartDrawer = () => setCartDrawerOpen(true);
  const closeCartDrawer = () => setCartDrawerOpen(false);
  const toggleCartDrawer = () => setCartDrawerOpen((prev) => !prev);

  return (
    <CartDrawerContext.Provider
      value={{
        cartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        toggleCartDrawer
      }}
    >
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error('useCartDrawer must be used within CartDrawerProvider');
  }
  return context;
}
