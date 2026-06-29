import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { subscribeAuth, ClientUser, ADMIN_EMAILS } from '../firebase';
import { onSnapshot, doc } from 'firebase/firestore';
import { dbInstance } from '../firebase';

interface AuthContextType {
  currentUser: ClientUser | null;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ClientUser | null>(null);
  const [adminsList, setAdminsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to admin document for current user
    if (dbInstance && currentUser) {
      const docRef = doc(dbInstance, 'admins', currentUser.uid);
      const unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          if (currentUser.email) {
            setAdminsList([currentUser.email]); // User is authenticated admin
          } else {
            setAdminsList(ADMIN_EMAILS);
          }
        } else {
          setAdminsList(ADMIN_EMAILS);
        }
      }, () => {
        setAdminsList(ADMIN_EMAILS);
      });
      return () => unsub();
    } else {
      setAdminsList(ADMIN_EMAILS);
    }
  }, [currentUser]);

  const isAdmin = useMemo(() => {
    if (currentUser && currentUser.email) {
      const emailLower = currentUser.email.toLowerCase();
      
      const envAdmins = import.meta.env.VITE_INITIAL_ADMINS;
      const defaultAdmins = envAdmins 
        ? envAdmins.split(',').map((e: string) => e.trim().toLowerCase()) 
        : ["admin@shivsayaproperties.com", "shivsayaproperties@gmail.com", "divansh0027@gmail.com"];
      
      const isInAdminsList = adminsList.some(
        email => email.toLowerCase() === emailLower
      ) || defaultAdmins.includes(emailLower);
      
      const hasAdminFlag = !!currentUser.isAdmin;
      return isInAdminsList || hasAdminFlag;
    }
    return false;
  }, [currentUser, adminsList]);

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
