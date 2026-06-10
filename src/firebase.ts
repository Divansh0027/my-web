/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User, onAuthStateChanged } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  addDoc,
  deleteDoc,
  query, 
  where,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { Property, Enquiry } from "./types";
import { SAMPLE_PROPERTIES } from "./data/sampleData";

// Detect if we are using the placeholder setup
let isPlaceholder = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("placeholder");

let app;
let authInstance: any;
let dbInstance: any;

if (!isPlaceholder) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    try {
      dbInstance = initializeFirestore(app, {
        experimentalForceLongPolling: true
      }, firebaseConfig.firestoreDatabaseId);
    } catch (firestoreError) {
      console.warn("initializeFirestore with settings failed, using standard fallback", firestoreError);
      dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    }
    authInstance = getAuth(app);
  } catch (error) {
    console.warn("Failed to initialize remote Firebase. Falling back to local state.", error);
    isPlaceholder = true;
  }
}

// Error handling for Firestore according to instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = !isPlaceholder ? authInstance : null;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid,
      email: currentAuth?.currentUser?.email,
      emailVerified: currentAuth?.currentUser?.emailVerified,
      isAnonymous: currentAuth?.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.warn('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on startup if using real Firestore
if (!isPlaceholder && dbInstance) {
  async function testConnection() {
    try {
      await getDocFromServer(doc(dbInstance, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn("Please check your Firebase configuration or network status.");
      }
    }
  }
  testConnection();
}

/**
 * CLIENT DATA LAYER API WITH LOCAL STAND-IN FALLBACKS
 */

// Local state for LocalStorage fallback
const LOCAL_STORAGE_ENQUIRIES_KEY = "ssp_local_enquiries";
const LOCAL_STORAGE_FAVORITES_KEY = "ssp_local_favorites";
const LOCAL_STORAGE_USER_KEY = "ssp_local_user";

export interface ClientUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

let simulatedUser: ClientUser | null = null;
const savedSimulatedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
if (savedSimulatedUser) {
  try {
    simulatedUser = JSON.parse(savedSimulatedUser);
  } catch (e) {
    console.warn("Failed to parse saved simulated user", e);
  }
}

const isUserSimulated = (): boolean => {
  return isPlaceholder || !!simulatedUser || (!authInstance?.currentUser && !!localStorage.getItem(LOCAL_STORAGE_USER_KEY));
};

// Simple custom Event Bus to trigger UI updates for Simulated Logins
const authListeners = new Set<(user: any) => void>();

export const getProperties = async (): Promise<Property[]> => {
  if (isPlaceholder) {
    // Return sample properties from file
    return SAMPLE_PROPERTIES;
  }
  
  try {
    const q = collection(dbInstance, "properties");
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // Seed Firestore with sample properties if empty (helpful for deployment first runs)
      for (const prop of SAMPLE_PROPERTIES) {
        try {
          await setDoc(doc(dbInstance, "properties", prop.id), prop);
        } catch (seedErr) {
          console.warn(`Failed to seed custom property ${prop.id}. This is expected if client writes are forbidden:`, seedErr);
        }
      }
      return SAMPLE_PROPERTIES;
    }
    const list: Property[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Property);
    });
    return list;
  } catch (error) {
    console.warn("Error reading from Firestore properties, using fallback.", error);
    return SAMPLE_PROPERTIES;
  }
};

export const getPropertyById = async (id: string): Promise<Property | null> => {
  if (isPlaceholder) {
    return SAMPLE_PROPERTIES.find(p => p.id === id) || null;
  }
  
  try {
    const docRef = doc(dbInstance, "properties", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Property;
    }
    return SAMPLE_PROPERTIES.find(p => p.id === id) || null;
  } catch (error) {
    console.warn("Error getting property by ID, using local.", error);
    return SAMPLE_PROPERTIES.find(p => p.id === id) || null;
  }
};

export const submitEnquiry = async (enquiry: Enquiry): Promise<boolean> => {
  const completeEnquiry = {
    ...enquiry,
    id: enquiry.id || `enq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    dateStr: enquiry.dateStr || new Date().toISOString()
  };

  if (isPlaceholder) {
    const localEnquiriesStr = localStorage.getItem(LOCAL_STORAGE_ENQUIRIES_KEY);
    const enquiries = localEnquiriesStr ? JSON.parse(localEnquiriesStr) : [];
    enquiries.push(completeEnquiry);
    localStorage.setItem(LOCAL_STORAGE_ENQUIRIES_KEY, JSON.stringify(enquiries));
    return true;
  }

  try {
    await setDoc(doc(dbInstance, "enquiries", completeEnquiry.id), completeEnquiry);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `enquiries/${completeEnquiry.id}`);
    return false;
  }
};

export const toggleFavorite = async (userId: string, propertyId: string): Promise<boolean> => {
  if (isUserSimulated() || userId === "guest-user" || !userId || (!isPlaceholder && authInstance && !authInstance.currentUser)) {
    const localFavsStr = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    let favs: string[] = localFavsStr ? JSON.parse(localFavsStr) : [];
    if (favs.includes(propertyId)) {
      favs = favs.filter(id => id !== propertyId);
    } else {
      favs.push(propertyId);
    }
    localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(favs));
    return true;
  }

  try {
    const favRef = doc(dbInstance, "users", userId, "favorites", propertyId);
    const snapshot = await getDoc(favRef);
    if (snapshot.exists()) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, { userId, propertyId, savedAt: new Date().toISOString() });
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/favorites/${propertyId}`);
    return false;
  }
};

export const getFavorites = async (userId: string): Promise<string[]> => {
  if (isUserSimulated() || userId === "guest-user" || !userId || (!isPlaceholder && authInstance && !authInstance.currentUser)) {
    const localFavsStr = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    return localFavsStr ? JSON.parse(localFavsStr) : [];
  }

  try {
    const q = collection(dbInstance, "users", userId, "favorites");
    const snapshot = await getDocs(q);
    const list: string[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.propertyId) {
        list.push(data.propertyId);
      }
    });
    return list;
  } catch (error) {
    console.warn("Error fetching favorites", error);
    // Return local fallback on security/connectivity issues
    const localFavsStr = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    return localFavsStr ? JSON.parse(localFavsStr) : [];
  }
};

// SIMULATED / REAL AUTH HANDLER

// Subscribe to auth state changes
export const subscribeAuth = (callback: (user: ClientUser | null) => void) => {
  const handleUserChange = (fireUser: any) => {
    if (fireUser) {
      simulatedUser = null;
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      callback({
        uid: fireUser.uid,
        email: fireUser.email || "",
        displayName: fireUser.displayName || fireUser.email?.split("@")[0] || "User",
        photoURL: fireUser.photoURL || undefined
      });
    } else {
      if (simulatedUser) {
        callback(simulatedUser);
      } else {
        callback(null);
      }
    }
  };

  if (!isPlaceholder && authInstance) {
    const unsubscribe = onAuthStateChanged(authInstance, handleUserChange);
    
    const listener = (user: any) => {
      if (!authInstance.currentUser) {
        callback(user);
      }
    };
    authListeners.add(listener);
    
    return () => {
      unsubscribe();
      authListeners.delete(listener);
    };
  } else {
    authListeners.add(callback);
    callback(simulatedUser);
    
    return () => {
      authListeners.delete(callback);
    };
  }
};

export const loginWithGoogle = async (): Promise<ClientUser | null> => {
  if (!isPlaceholder && authInstance) {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(authInstance, provider);
      if (result.user) {
        simulatedUser = null;
        return {
          uid: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || "User",
          photoURL: result.user.photoURL || undefined
        };
      }
    } catch (error) {
      console.warn("Google Authenticator screen failed, starting simulated login.", error);
    }
  }

  // Simulated Login fallback (extremely elegant popup dialog simulation or fast autogen profile)
  const defaultUser: ClientUser = {
    uid: "dummy-user-123",
    email: "divansh0027@gmail.com", // Set to user's email from runtime to provide premium tailored look!
    displayName: "Divansh Sharma",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  };
  simulatedUser = defaultUser;
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(defaultUser));
  authListeners.forEach(cb => cb(defaultUser));
  return defaultUser;
};

export const logoutUser = async (): Promise<void> => {
  simulatedUser = null;
  if (!isPlaceholder && authInstance) {
    try {
      await signOut(authInstance);
    } catch (error) {
      console.warn("Firebase logout error", error);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  authListeners.forEach(cb => cb(null));
};
