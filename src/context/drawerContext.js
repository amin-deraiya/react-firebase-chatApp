import React, { createContext, useContext } from 'react';

const drawerContext = createContext();

export function DrawerContextProvider({ children }) {
  const [open, setOpen] = React.useState(true);

  return <drawerContext.Provider value={{ open, setOpen }}>{children}</drawerContext.Provider>;
}

export function useDrawer() {
  return useContext(drawerContext);
}
