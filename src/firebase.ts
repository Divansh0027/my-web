/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
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
  getDocFromServer,
  onSnapshot
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
  phone?: string;
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

export let ADMIN_EMAILS = ["admin@shivsayaproperties.com"];

// Load from localStorage if present
try {
  const storedAdmins = localStorage.getItem("ssp_admin_emails");
  if (storedAdmins) {
    const parsed = JSON.parse(storedAdmins);
    if (Array.isArray(parsed)) {
      const merged = Array.from(new Set(["admin@shivsayaproperties.com", ...parsed]));
      ADMIN_EMAILS = merged;
    }
  }
} catch (e) {
  console.warn("Failed to load admin emails", e);
}

export const isAdminUser = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === email.toLowerCase());
};

export const loginWithGoogle = async (): Promise<ClientUser | null> => {
  if (!isPlaceholder && authInstance) {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(authInstance, provider);
      if (result.user) {
        // If banned check is requested, let's verify if user record has banned: true
        try {
          const docRef = doc(dbInstance, "users", result.user.uid);
          const uDoc = await getDoc(docRef);
          if (uDoc.exists() && uDoc.data()?.banned === true) {
            await signOut(authInstance);
            throw new Error("Your account has been suspended. Contact support@shivsayaproperties.com");
          }
        } catch (dbErr) {
          console.warn("Failed banned check for Google user:", dbErr);
        }

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
    email: "guest@shivsayaproperties.com", // Sanitized guest placeholder as per instructions
    displayName: "Guest User",
    photoURL: undefined
  };
  simulatedUser = defaultUser;
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(defaultUser));
  authListeners.forEach(cb => cb(defaultUser));
  return defaultUser;
};

const SIMULATED_DB_USERS_KEY = "ssp_simulated_db_users";

const getSimulatedDbUsers = (): any[] => {
  const usersStr = localStorage.getItem(SIMULATED_DB_USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

const saveSimulatedDbUser = (user: any) => {
  const users = getSimulatedDbUsers();
  users.push(user);
  localStorage.setItem(SIMULATED_DB_USERS_KEY, JSON.stringify(users));
};

export const loginWithEmailPassword = async (email: string, password: string): Promise<ClientUser> => {
  if (!isPlaceholder && authInstance) {
    try {
      const result = await signInWithEmailAndPassword(authInstance, email, password);
      // Check if banned
      try {
        const uDoc = await getDoc(doc(dbInstance, "users", result.user.uid));
        if (uDoc.exists() && uDoc.data()?.banned === true) {
          await signOut(authInstance);
          throw new Error("Your account has been suspended. Contact support@shivsayaproperties.com");
        }
      } catch (err) {
        console.warn("Banned check failed on Firebase:", err);
      }
      return {
        uid: result.user.uid,
        email: result.user.email || "",
        displayName: result.user.displayName || result.user.email?.split("@")[0] || "User",
        photoURL: result.user.photoURL || undefined
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Simulated login check
  const users = getSimulatedDbUsers();
  const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!matchedUser) {
    throw new Error("auth/user-not-found - Account does not exist. Please register first.");
  }
  
  if (matchedUser.banned === true) {
    throw new Error("Your account has been suspended. Contact support@shivsayaproperties.com");
  }

  // Passwords are never stored. Simulated auth only tracks user identity.
  // We simply allow any password for simulated accounts since we no longer verify passwords in simulation.
  // Real auth uses Firebase Authentication.

  const clientUser: ClientUser = {
    uid: matchedUser.uid,
    email: matchedUser.email,
    displayName: matchedUser.displayName,
    photoURL: undefined
  };
  simulatedUser = clientUser;
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(clientUser));
  authListeners.forEach(cb => cb(clientUser));
  return clientUser;
};

export const signUpWithEmailPassword = async (name: string, email: string, phone: string, password: string): Promise<ClientUser> => {
  if (!isPlaceholder && authInstance) {
    try {
      const result = await createUserWithEmailAndPassword(authInstance, email, password);
      await updateProfile(result.user, { displayName: name });

      try {
        await setDoc(doc(dbInstance, "users", result.user.uid), {
          uid: result.user.uid,
          email,
          displayName: name,
          phone,
          createdAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("Failed index for users table", dbErr);
      }

      return {
        uid: result.user.uid,
        email: result.user.email || "",
        displayName: name,
        photoURL: undefined
      };
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  // Simulated Registration validation query
  const users = getSimulatedDbUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("auth/email-already-in-use - This email address is already linked to an account.");
  }

  // Passwords are never stored.
  // Simulated auth only tracks user identity.
  const newUser = {
    uid: `simulated-uid-${Date.now()}`,
    email,
    displayName: name,
    phone,
    createdAt: new Date().toISOString()
  };

  saveSimulatedDbUser(newUser);

  const clientUser: ClientUser = {
    uid: newUser.uid,
    email: newUser.email,
    displayName: newUser.displayName,
    photoURL: undefined
  };
  simulatedUser = clientUser;
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(clientUser));
  authListeners.forEach(cb => cb(clientUser));
  return clientUser;
};

export const sendPasswordReset = async (email: string): Promise<boolean> => {
  if (!isPlaceholder && authInstance) {
    try {
      await sendPasswordResetEmail(authInstance, email);
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  }

  // Simulated
  const users = getSimulatedDbUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase()) || email === "guest@shivsayaproperties.com";
  if (!exists) {
    throw new Error("auth/user-not-found - No profile connected to this email.");
  }
  return true;
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

export const updateUserProfileDetails = async (name: string, email: string, phone: string): Promise<boolean> => {
  if (!isPlaceholder && authInstance && authInstance.currentUser) {
    try {
      await updateProfile(authInstance.currentUser, { displayName: name });
      const docRef = doc(dbInstance, "users", authInstance.currentUser.uid);
      await setDoc(docRef, {
        uid: authInstance.currentUser.uid,
        displayName: name,
        email,
        phone,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error("Firestore user patch failed:", err);
      return false;
    }
  }

  if (simulatedUser) {
    const updated = {
      ...simulatedUser,
      displayName: name,
      email,
      phone
    };
    simulatedUser = updated;
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    authListeners.forEach(cb => cb(updated));
    return true;
  }
  return false;
};

export const addProperty = async (property: Property): Promise<boolean> => {
  if (isPlaceholder) {
    // Return true, App.tsx handles state updates directly
    return true;
  }

  try {
    const docRef = doc(dbInstance, "properties", property.id);
    await setDoc(docRef, property);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `properties/${property.id}`);
    return false;
  }
};

export const subscribeProperties = (callback: (props: Property[]) => void): (() => void) => {
  if (isPlaceholder) {
    callback(SAMPLE_PROPERTIES);
    return () => {};
  }

  try {
    const q = collection(dbInstance, "properties");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        SAMPLE_PROPERTIES.forEach(async (prop) => {
          try {
            await setDoc(doc(dbInstance, "properties", prop.id), prop);
          } catch (e) {
            console.warn("Properties seeding snapshot issue", e);
          }
        });
        callback(SAMPLE_PROPERTIES);
        return;
      }
      const list: Property[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Property);
      });
      callback(list);
    }, (error) => {
      console.warn("onSnapshot failed. Falling back to sample properties.", error);
      callback(SAMPLE_PROPERTIES);
    });
    return unsubscribe;
  } catch (err) {
    console.warn("Properties subscription crash, listing standard list.", err);
    callback(SAMPLE_PROPERTIES);
    return () => {};
  }
};

export const updatePropertyInDb = async (property: Property): Promise<boolean> => {
  if (isPlaceholder) {
    return true;
  }
  try {
    const docRef = doc(dbInstance, "properties", property.id);
    await setDoc(docRef, property, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `properties/${property.id}`);
    return false;
  }
};

export const deletePropertyFromDb = async (id: string): Promise<boolean> => {
  if (isPlaceholder) {
    return true;
  }
  try {
    const docRef = doc(dbInstance, "properties", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `properties/${id}`);
    return false;
  }
};

