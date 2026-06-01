// context/DrawerContext.tsx
// Holds open/close refs so any screen can open the drawer
// without prop-drilling. The Provider lives in app/_layout.tsx
// (root level) so it's available to ALL screens including those
// inside Expo Router's nested Stack navigators.

import React, { createContext, useCallback, useContext, useRef } from "react";

type DrawerCtx = {
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Called once by DrawerNavigator to hand over its open/close fns */
  registerHandlers: (open: () => void, close: () => void) => void;
};

const DrawerContext = createContext<DrawerCtx>({
  openDrawer: () => {},
  closeDrawer: () => {},
  registerHandlers: () => {},
});

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const openRef  = useRef<() => void>(() => {});
  const closeRef = useRef<() => void>(() => {});

  const registerHandlers = useCallback((open: () => void, close: () => void) => {
    openRef.current  = open;
    closeRef.current = close;
  }, []);

  const openDrawer  = useCallback(() => openRef.current(),  []);
  const closeDrawer = useCallback(() => closeRef.current(), []);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, registerHandlers }}>
      {children}
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => useContext(DrawerContext);
