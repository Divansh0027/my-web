import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { subscribeAuth, ClientUser, ADMIN_EMAILS } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
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
    // Listen to admin emails
    if (dbInstance) {
      const unsub = onSnapshot(collection(dbInstance, 'admins'), (snapshot) => {
        const emails: string[] = [];
        snapshot.forEach(doc => {
          if (doc.data().email) {
            emails.push(doc.data().email);
          } else if (doc.id.includes('@')) {
            emails.push(doc.id);
          }
        });
        setAdminsList(emails.length > 0 ? emails : ADMIN_EMAILS);
      }, () => {
        setAdminsList(ADMIN_EMAILS);
      });
      return () => unsub();
    } else {
      setAdminsList(ADMIN_EMAILS);
    }
  }, []);

  const isAdmin = useMemo(() => {
    if (currentUser && currentUser.email) {
      const emailLower = currentUser.email.toLowerCase();
      const isInAdminsList = adminsList.some(
        email => email.toLowerCase() === emailLower
      );
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
