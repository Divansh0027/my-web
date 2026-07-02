import React, { createContext, useContext } from 'react';
import { AdminTabProps } from '../types';

const AdminContext = createContext<AdminTabProps | null>(null);

export const AdminProvider = ({ children, value }: { children: React.ReactNode, value: AdminTabProps }) => {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
