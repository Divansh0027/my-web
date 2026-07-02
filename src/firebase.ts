/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  deleteDoc,
  query, 
  where,
  getDocFromServer,
  onSnapshot,
  setLogLevel,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";


import { Property, Enquiry } from "./types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
  measurementId: ""
};

const isProd = import.meta.env.PROD;
const missingKeys: string[] = [];
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("placeholder")) missingKeys.push("VITE_FIREBASE_API_KEY");
if (!firebaseConfig.projectId || firebaseConfig.projectId.includes("placeholder")) missingKeys.push("VITE_FIREBASE_PROJECT_ID");
if (missingKeys.length > 0) {
  console.error("Missing Firebase environment variables:", missingKeys.join(", "));
  if (isProd) {
    if (import.meta.env.PROD) { throw new Error(`Production: Missing Firebase env vars: ${missingKeys.join(", ")}`); } else { console.error(`[Dev] Missing Firebase env vars: ${missingKeys.join(", ")}`); console.error("App will run in offline/guest mode."); }
  }
}

// Quiet Firestore connection logs to avoid warning/error spam in testing consoles
try {
  setLogLevel("silent");
} catch (e) {
  console.warn("Could not set Firestore log level", e);
}

let app: any;
let authInstance: Auth | undefined;
export let dbInstance: Firestore | undefined;
let storageInstance: FirebaseStorage | undefined;
export let analyticsInstance: any = undefined;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  try {
    dbInstance = initializeFirestore(app, {
    }, firebaseConfig.firestoreDatabaseId);
  } catch (firestoreError) {
    console.warn("initializeFirestore with settings failed, using standard fallback", firestoreError);
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
  authInstance = getAuth(app);
  storageInstance = getStorage(app);

  try {
    const appCheckKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (appCheckKey && typeof window !== "undefined") {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(appCheckKey),
        isTokenAutoRefreshEnabled: true
      });
    } else if (import.meta.env.DEV) {
      // Allow App check in dev with debug token if we want, but usually it relies on self.FIREBASE_APPCHECK_DEBUG_TOKEN
      // Just initialize with a dummy if needed, but safe to skip if no key
    }
  } catch (appCheckError) {
    console.warn("Failed to initialize App Check", appCheckError);
  }

  
  // Initialize Analytics only if supported (browser)
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore errors checking for analytics support
  });
} catch (error) {
  console.warn("Failed to initialize remote Firebase. Falling back to local state.", error);
  
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
    isAnonymous?: boolean | null;
  }
}

export class FirestoreError extends Error {
  constructor(public info: FirestoreErrorInfo) {
    super(info.error);
    this.name = 'FirestoreError';
  }
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const currentAuth = authInstance;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error 
      ? error.message 
      : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid ?? null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous ?? null,
    },
    operationType,
    path
  };
  console.warn(
    "[Shiv Saya] Firestore operation failed:",
    { operationType: errInfo.operationType, path: errInfo.path, error: errInfo.error, userId: errInfo.authInfo.userId }
  );
  return errInfo;
}


// Validate connection on startup silently if using real Firestore
// (Removed active getDocFromServer call to prevent pre-emptive connection warning spam on slow cold start)

// Diagnostic utility for Firestore connectivity
export async function testFirestoreConnection(): Promise<{ success: boolean; message: string; details?: Record<string, string | number | boolean | null> }> {
  if (!dbInstance) {
    return { success: false, message: "Firestore is not initialized." };
  }
  try {
    // Attempting to read a public or dummy document to force a backend network call
    await getDocFromServer(doc(dbInstance as Firestore, 'test', 'network_diagnostic_check'));
    return { success: true, message: "Firestore connection successful." };
  } catch (error: any) {
    let message = "Firestore connection failed.";
    if (error?.code === "unavailable") {
      message = "Network unavailable. Client may be offline or firestore blocked by firewall.";
    } else if (error?.code === "permission-denied") {
      // Permission denied still indicates reachability
      return { success: true, message: "Firestore reachable (permission denied, which verifies network connectivity)." };
    }
    return { success: false, message, details: error?.message || error };
  }
}

/**
 * Helper to recursively remove undefined values from objects before writing them to Firestore.
 */
export function cleanForFirestore<T>(obj: T): T {
  if (typeof obj === "string") {
    return obj.trim().substring(0, 500000) as unknown as T;
  }
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof Date) {
    return obj as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanForFirestore(item)) as any;
  }
  const cleaned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = cleanForFirestore(val);
      }
    }
  }
  return cleaned;
}

export const trackEvent = (eventName: string, eventParams?: any) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, eventName, eventParams);
  }
};

/**
 * CLIENT DATA LAYER API WITH LOCAL STAND-IN FALLBACKS
 */

// Local state for LocalStorage fallback
const LOCAL_STORAGE_FAVORITES_KEY = "ssp_local_favorites";

export interface ClientUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | undefined;
  phone?: string | undefined;
  isAdmin?: boolean | undefined;
}

export type AuthResult = { success: true; user: ClientUser } | { success: false; error: string; banned?: boolean };


const authListeners = new Set<(user: ClientUser | null) => void>();


export const getProperties = async (): Promise<Property[]> => {
  try {
    const q = collection(dbInstance as Firestore, "properties");
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    const list: Property[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Property);
    });
    return list;
  } catch (error) {
    console.warn("Error reading from Firestore properties.", error);
    return [];
  }
};


export const getPropertyById = async (id: string): Promise<Property | null> => {
  
  
  try {
    const docRef = doc(dbInstance as Firestore, "properties", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Property;
    }
    return null;
  } catch (error) {
    console.warn("Error getting property by ID, using local.", error);
    return null;
  }
};

export const submitEnquiry = async (enquiry: Enquiry): Promise<{ success: boolean; savedLocally: boolean; error?: string }> => {
  const lastEnquiryTime = localStorage.getItem("ssp_last_enquiry_time");
  if (lastEnquiryTime && Date.now() - parseInt(lastEnquiryTime) < 60000) {
    return { success: false, savedLocally: false, error: "You are submitting too fast. Please wait a minute." };
  }

  const completeEnquiry = {
    ...enquiry,
    id: enquiry.id || `enq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    dateStr: enquiry.dateStr || new Date().toISOString()
  };

  localStorage.setItem("ssp_last_enquiry_time", Date.now().toString());

  try {
    await setDoc(doc(dbInstance as Firestore, "enquiries", completeEnquiry.id), cleanForFirestore(completeEnquiry));
    return { success: true, savedLocally: false };
  } catch (error) {
    console.warn("Firestore submitEnquiry failed, falling back to local storage:", error);
    
    try {
      const localEnquiriesStr = localStorage.getItem("ssp_local_enquiries");
      const enquiries = localEnquiriesStr ? JSON.parse(localEnquiriesStr) : [];
      enquiries.push(completeEnquiry);
      localStorage.setItem("ssp_local_enquiries", JSON.stringify(enquiries));
    } catch (localStoreErr) {
      console.warn("Local storage fallback insertion failed", localStoreErr);
    }
    
    return { success: true, savedLocally: true };
  }
};

export const toggleFavorite = async (userId: string, propertyId: string): Promise<boolean> => {
  if (userId === "guest-user" || !userId || (!authInstance?.currentUser)) {
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
    const favRef = doc(dbInstance as Firestore, "users", userId, "favorites", propertyId);
    const snapshot = await getDoc(favRef);
    if (snapshot.exists()) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, { userId, propertyId, savedAt: new Date().toISOString() });
    }
    return true;
  } catch (error) {
    console.error('toggleFavorite failed:', error);
    return false;
  }
};

export const getFavorites = async (userId: string): Promise<string[]> => {
  if (userId === "guest-user" || !userId || (!authInstance?.currentUser)) {
    const localFavsStr = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    return localFavsStr ? JSON.parse(localFavsStr) : [];
  }

  try {
    const q = collection(dbInstance as Firestore, "users", userId, "favorites");
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
  const handleUserChange = async (fireUser: import("firebase/auth").User | null) => {
    try {
      if (fireUser) {
        // Background verification of banned status
        let isBanned = false;
        let isAdmin = false;
        try {
          const uDoc = await getDoc(doc(dbInstance as Firestore, "users", fireUser.uid));
          if (uDoc.exists() && uDoc.data()?.banned === true) {
            isBanned = true;
          }
        } catch (err) {
          console.warn("Banned check failed on auth subscription change", err);
        }

        if (isBanned) {
          if (authInstance) await signOut(authInstance);
          
          callback(null);
          return;
        }

        
        try {
          // First try UID-based lookup (correct standard)
          const aDoc = await getDoc(
            doc(dbInstance as Firestore, "admins", fireUser.uid)
          );
          if (aDoc.exists()) {
            isAdmin = true;
          } else if (fireUser.email) {
            // Fallback: check if any admin doc has matching
            // email field (handles legacy email-keyed docs)
            const emailQuery = query(
              collection(dbInstance as Firestore, "admins"),
              where("email", "==", fireUser.email.toLowerCase())
            );
            const emailSnap = await getDocs(emailQuery);
            if (!emailSnap.empty) {
              isAdmin = true;
              // Migrate legacy doc: create correct UID-keyed
              // doc and remove the old email-keyed one
              const legacyDoc = emailSnap.docs[0];
              if (legacyDoc.id !== fireUser.uid) {
                try {
                  await setDoc(
                    doc(dbInstance as Firestore, "admins", fireUser.uid),
                    {
                      uid: fireUser.uid,
                      email: fireUser.email.toLowerCase(),
                      addedAt: legacyDoc.data().addedAt || new Date().toISOString(),
                      migratedAt: new Date().toISOString()
                    }
                  );
                  await deleteDoc(
                    doc(dbInstance as Firestore, "admins", legacyDoc.id)
                  );
                } catch (migErr) {
                  console.warn("Admin doc migration skipped:", migErr);
                }
              }
            }
          }
        } catch (err) {
          console.warn("Admin status check failed:", err);
        }

        

        callback({
          uid: fireUser.uid,
          email: fireUser.email || "",
          displayName: fireUser.displayName || fireUser.email?.split("@")[0] || "User",
          photoURL: fireUser.photoURL || undefined,
          isAdmin: isAdmin
        });
      } else {
        callback(null);
      }
    } catch (err) {
      console.error('Auth subscription error:', err);
      callback(null);
    }
  };

  if (authInstance) {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      handleUserChange(user);
    });
    
    const listener = (user: ClientUser | null) => {
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
    console.warn(
      "[Shiv Saya] Firebase Auth not initialized. " +
      "App running in offline/guest mode. " +
      "Check Firebase config and network connection."
    );
    try {
      callback(null);
    } catch (callbackErr) {
      console.warn("Auth callback error in guest mode:", callbackErr);
    }
    return () => {};
  }
};


export let ADMIN_EMAILS: string[] = [];
export const isAdminUser = (user: ClientUser | null | undefined): boolean => {
  return !!user?.isAdmin;
};

// Real-time Database Config synchronizers (Issue 3, 8 & 11)
export const subscribeRemoteAdmins = (callback: (emails: string[]) => void): (() => void) => {
  const getMergedAdmins = (): string[] => {
    
    
    let storedAdmins: string[] = [];
    try {
      const stored = localStorage.getItem("ssp_admin_emails");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(x => typeof x === 'string')) {
          storedAdmins = parsed;
        }
      }
    } catch { /* ignore */ }
    
    return Array.from(new Set([...storedAdmins]));
  };

  const fallback = getMergedAdmins();
  ADMIN_EMAILS = fallback;
  
  if (!dbInstance) {
    callback(fallback);
    return () => {};
  }

  try {
    const unsub = onSnapshot(collection(dbInstance as Firestore, "admins"), (snapshot) => {
      const list: string[] = [];
      
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Read email field from doc data
        if (data.email) {
          list.push(data.email.toLowerCase());
        } else if (docSnap.id.includes("@")) {
          // Legacy: doc ID is the email itself
          list.push(docSnap.id.toLowerCase());
        }
      });
      const uniqueAdmins = Array.from(new Set([...list]));
      ADMIN_EMAILS = uniqueAdmins;
      callback(uniqueAdmins);
      localStorage.setItem("ssp_admin_emails", JSON.stringify(uniqueAdmins));
    }, (err) => {
      console.log("Info: using local/cached admin fallback (dynamic sync active):", err?.message || err);
      callback(fallback);
    });
    return unsub;
  } catch (err) {
    callback(fallback);
    return () => {};
  }
};

export const addRemoteAdmin = async (email: string): Promise<boolean> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!dbInstance) return false;
  
  try {
    const q = query(collection(dbInstance as Firestore, "users"), where("email", "==", cleanEmail));
    const snap = await getDocs(q);
    if (snap.empty) {
      // User has not signed up yet. Store as a
      // pending admin doc keyed by email.
      // When they sign up, Fix 3 migration will
      // convert it to a UID-keyed doc automatically.
      await setDoc(
        doc(dbInstance as Firestore, "admins", cleanEmail),
        {
          email: cleanEmail,
          addedAt: new Date().toISOString(),
          pendingUid: true,
          note: "Will migrate to UID on first login"
        }
      );
      console.log("Pending admin email registered:", cleanEmail);
      return true;
    }
    const docData = snap.docs[0].data();
    const uid = docData.uid || snap.docs[0].id;

    await setDoc(doc(dbInstance as Firestore, "admins", uid), {
      email: cleanEmail,
      uid,
      addedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn("Failed adding remote admin", err);
    return false;
  }
};

export const removeRemoteAdmin = async (email: string): Promise<boolean> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!dbInstance) return false;
  
  try {
    const q = query(collection(dbInstance as Firestore, "users"), where("email", "==", cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0].data();
      const uid = docData.uid || snap.docs[0].id;
      await deleteDoc(doc(dbInstance as Firestore, "admins", uid));
      return true;
    }
    // Also try checking the pending admins keyed by email
    await deleteDoc(doc(dbInstance as Firestore, "admins", cleanEmail));
    return true;
  } catch (err) {
    console.warn("Failed removing remote admin", err);
    return false;
  }
};

// System Controls Sync (Issue 8)
export const subscribeRemoteControls = (callback: (controls: any) => void): (() => void) => {
  const localVal = localStorage.getItem("ssp_controls");
  const fallback = localVal ? JSON.parse(localVal) : { maintenanceMode: false, offlineMaintenance: false, slowMode: false };
  
  if (!dbInstance) {
    callback(fallback);
    return () => {};
  }
  
  try {
    const unsub = onSnapshot(doc(dbInstance as Firestore, "controls", "site_controls"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data);
        localStorage.setItem("ssp_controls", JSON.stringify(data));
      } else {
        callback(fallback);
      }
    }, (err) => {
      console.log("Info: using local/cached controls fallback (dynamic sync active):", err?.message || err);
      callback(fallback);
    });
    return unsub;
  } catch (err) {
    callback(fallback);
    return () => {};
  }
};

export const updateRemoteControls = async (controls: any): Promise<boolean> => {
  localStorage.setItem("ssp_controls", JSON.stringify(controls));
  if (!dbInstance) return false;
  try {
    await setDoc(doc(dbInstance as Firestore, "controls", "site_controls"), cleanForFirestore(controls), { merge: true });
    return true;
  } catch (err) {
    console.warn("Failed updating remote controls", err);
    return false;
  }
};

// Business Settings Sync (Issue 11)
export const subscribeRemoteSettings = (callback: (settings: any) => void): (() => void) => {
  const localVal = localStorage.getItem("ssp_settings");
  const fallback = localVal ? JSON.parse(localVal) : null;
  
  if (!dbInstance) {
    if (fallback) callback(fallback);
    return () => {};
  }
  
  try {
    const unsub = onSnapshot(doc(dbInstance as Firestore, "settings", "business_settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data);
        localStorage.setItem("ssp_settings", JSON.stringify(data));
      } else {
        if (fallback) {
          callback(fallback);
        }
      }
    }, (err) => {
      console.log("Info: using local/cached settings fallback (dynamic sync active):", err?.message || err);
      if (fallback) callback(fallback);
    });
    return unsub;
  } catch (err) {
    if (fallback) callback(fallback);
    return () => {};
  }
};

export const updateRemoteSettings = async (settings: any): Promise<boolean> => {
  localStorage.setItem("ssp_settings", JSON.stringify(settings));
  if (!dbInstance) return false;
  try {
    await setDoc(doc(dbInstance as Firestore, "settings", "business_settings"), cleanForFirestore(settings), { merge: true });
    return true;
  } catch (err) {
    console.warn("Failed updating remote settings", err);
    return false;
  }
};

export const loginWithGoogle = async (): Promise<AuthResult> => {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("placeholder")) {
    return { success: false, error: "Missing VITE_FIREBASE_API_KEY. Please set this in the AI Studio secret manager / .env." };
  }
  if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes("placeholder")) {
    return { success: false, error: "Missing VITE_FIREBASE_AUTH_DOMAIN." };
  }

  if (authInstance) {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(authInstance, provider);
      if (result.user) {
        let isBanned = false;
        let banMsg = "Your account has been suspended. Contact support@shivsayaproperties.com.";
        try {
          const docRef = doc(dbInstance as Firestore, "users", result.user.uid);
          const uDoc = await getDoc(docRef);
          if (uDoc.exists() && uDoc.data()?.banned === true) {
            isBanned = true;
            if (uDoc.data()?.bannedMessage) {
              banMsg = uDoc.data().bannedMessage;
            }
          }
        } catch (dbErr) {
          console.warn("Failed banned check for Google user:", dbErr);
        }

        if (isBanned) {
          await signOut(authInstance);
          return { success: false, error: banMsg, banned: true };
        }

        return {
          success: true,
          user: {
            uid: result.user.uid,
            email: result.user.email || "",
            displayName: result.user.displayName || "User",
            photoURL: result.user.photoURL || undefined
          }
        };
      }
    } catch (error: any) {
      if (error instanceof Error && error.message.includes("suspended")) {
        return { success: false, error: error.message, banned: true };
      }
      if (error?.code === "auth/internal-error" || error?.message?.includes("internal-error")) {
        return { success: false, error: "Firebase Error (auth/internal-error): Google Sign-in failed. Please verify in your Firebase Console that 'Google' is enabled under Authentication -> Sign-in Method, AND that you have selected a 'Support Email'. Ensure VITE_FIREBASE_AUTH_DOMAIN is correctly set."};
      }
      if (error?.code === "auth/popup-blocked") {
        return { success: false, error: "Google Sign-in popup was blocked. Please open this app in a new tab to sign in, or allow popups." };
      }
      if (error?.code === "auth/popup-closed-by-user") {
        return { success: false, error: "Sign-in was cancelled." };
      }
      return { success: false, error: error instanceof Error ? error.message : "Authentication failed" };
    }
  }

  return { success: false, error: "Authentication service is unavailable. Please check your internet connection and refresh the page. If the issue persists, contact support@shivsayaproperties.com" };
};



export const loginWithEmailPassword = async (email: string, password: string): Promise<AuthResult> => {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("placeholder")) {
    return { success: false, error: "Missing VITE_FIREBASE_API_KEY. Please set this in the AI Studio secret manager / .env." };
  }
  if (authInstance) {
    try {
      const result = await signInWithEmailAndPassword(authInstance, email, password);
      
      if (!result.user.emailVerified) {
        await authInstance.signOut();
        return { success: false, error: "Please verify your email before logging in. Check your inbox for the verification link." };
      }

      let isBanned = false;
      let banMsg = "Your account has been suspended. Contact support@shivsayaproperties.com.";
      try {
        const uDoc = await getDoc(doc(dbInstance as Firestore, "users", result.user.uid));
        if (uDoc.exists() && uDoc.data()?.banned === true) {
          isBanned = true;
          if (uDoc.data()?.bannedMessage) {
            banMsg = uDoc.data().bannedMessage;
          }
        }
      } catch (err) {
        console.warn("Banned check failed on Firebase:", err);
      }

      if (isBanned) {
        await signOut(authInstance);
        return { success: false, error: banMsg, banned: true };
      }

      return {
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || result.user.email?.split("@")[0] || "User",
          photoURL: result.user.photoURL || undefined
        }
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("suspended")) {
        return { success: false, error: error.message, banned: true };
      }
      return { success: false, error: error instanceof Error ? error.message : "Authentication failed" };
    }
  }

  return { success: false, error: "Authentication service is unavailable. Please check your internet connection and refresh the page. If the issue persists, contact support@shivsayaproperties.com" };
};

export const signUpWithEmailPassword = async (name: string, email: string, phone: string, password: string): Promise<ClientUser> => {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("placeholder")) {
    throw new Error("Missing VITE_FIREBASE_API_KEY. Please set this in the AI Studio secret manager / .env.");
  }
  if (authInstance) {
    try {
      const result = await createUserWithEmailAndPassword(authInstance, email, password);
      await updateProfile(result.user, { displayName: name });
      
      try {
        await sendEmailVerification(result.user);
      } catch (err) {
        console.warn("Failed to send verification email:", err);
      }

      try {
        await setDoc(doc(dbInstance as Firestore, "users", result.user.uid), {
          uid: result.user.uid,
          email,
          displayName: name,
          phone,
          createdAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("Failed index for users table", dbErr);
      }

      await authInstance.signOut();
      throw new Error("Account created successfully. Please check your email inbox to verify your account before logging in.");
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  throw new Error("Authentication service is unavailable. Please check your internet connection and refresh the page. If the issue persists, contact support@shivsayaproperties.com");
};

export const sendPasswordReset = async (email: string): Promise<boolean> => {
  if (authInstance) {
    try {
      await sendPasswordResetEmail(authInstance, email);
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  }

  throw new Error("Authentication service is unavailable. Please check your internet connection and refresh the page. If the issue persists, contact support@shivsayaproperties.com");
};

export const logoutUser = async (): Promise<void> => {
  if (authInstance) {
    await signOut(authInstance);
  }
  
  // Clear sensitive local caches on logout
  localStorage.removeItem("ssp_local_favorites");
  localStorage.removeItem("ssp_local_enquiries");
  localStorage.removeItem("ssp_property_draft_v2");
  
  authListeners.forEach(cb => cb(null));
};

export const updateUserProfileDetails = async (name: string, email: string, phone: string): Promise<boolean> => {
  if (authInstance?.currentUser) {
    try {
      await updateProfile(authInstance.currentUser, { displayName: name });
      const docRef = doc(dbInstance as Firestore, "users", authInstance.currentUser.uid);
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

  return false;
};

export const addProperty = async (property: Property): Promise<boolean> => {
  

  try {
    const docRef = doc(dbInstance as Firestore, "properties", property.id);
    await setDoc(docRef, cleanForFirestore(property));
    return true;
  } catch (error) {
    console.error('addProperty failed:', error);
    return false;
  }
};

export const subscribeProperties = (callback: (props: Property[]) => void): (() => void) => {
  

  let activeUnsubscribe: (() => void) | null = null;
  let isCancelled = false;

  const init = async () => {
    const q = collection(dbInstance as Firestore, "properties");

    if (isCancelled) return;

    try {
      activeUnsubscribe = onSnapshot(q, (snap) => {
        const list: Property[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as Property);
        });
        callback(list);
      }, (error) => {
        console.warn("Error subscribing to properties:", error);
      });
    } catch (snapErr) {
      console.warn("Failed to subscribe properties:", snapErr);
    }
  };

  init();

  return () => {
    isCancelled = true;
    if (activeUnsubscribe) {
      activeUnsubscribe();
    }
  };
};

export const updatePropertyInDb = async (property: Property): Promise<boolean> => {
  
  try {
    const docRef = doc(dbInstance as Firestore, "properties", property.id);
    await setDoc(docRef, cleanForFirestore(property), { merge: true });
    return true;
  } catch (error) {
    console.error('updatePropertyInDb failed:', error);
    return false;
  }
};

export const logAdminAction = async (action: string, targetId: string, adminEmail: string, details?: Record<string, string | number | boolean | null>) => {
  if (!dbInstance) return;
  try {
    await addDoc(collection(dbInstance as Firestore, 'audit_logs'), {
      action,
      targetId,
      adminEmail,
      details: cleanForFirestore(details || {}),
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};

export const deletePropertyFromDb = async (id: string): Promise<boolean> => {
  
  try {
    const docRef = doc(dbInstance as Firestore, "properties", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('deletePropertyFromDb failed:', error);
    return false;
  }
};

export const isStorageConnected = (): boolean => {
  return !!storageInstance;
};

async function compressToWebP(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        
        const MAX_WIDTH = 1920;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, "image/webp", 0.8);
      };
      img.onerror = () => resolve(file); // fallback to original on error
    };
    reader.onerror = () => resolve(file);
  });
}

export async function uploadPropertyImage(userId: string, file: File, _fileName: string): Promise<{ url: string }> {
  if (!storageInstance) throw new Error("Storage not initialized");
  
  const optimizedFile = await compressToWebP(file);
  
  const timestamp = Date.now();
  const cleanName = optimizedFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const storageRef = ref(storageInstance, `properties/${userId}/${timestamp}_${cleanName}`);
  try {
    const uploadPromise = uploadBytes(storageRef, optimizedFile);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Upload timeout exceeded")), 15000)
    );
    const snapshot = await Promise.race([uploadPromise, timeoutPromise]) as any;
    const url = await getDownloadURL(snapshot.ref);
    return { url };
  } catch (err) {
    console.error("Upload failed:", err);
    throw new Error("Image upload failed. Please try again.");
  }
}



