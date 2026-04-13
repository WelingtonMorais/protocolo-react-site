import React from "react";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface MenuContextValue {
  open: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export const MenuProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [open, setOpen] = useState(true);

  const toggleMenu = (): void => setOpen((prev) => !prev);
  const closeMenu = (): void => setOpen(false);

  return (
    <MenuContext.Provider value={{ open, toggleMenu, closeMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = (): MenuContextValue => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
};
