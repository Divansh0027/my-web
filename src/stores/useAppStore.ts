import { create } from 'zustand';


interface ToastState {
  message: string | null;
  type: 'success' | 'info' | 'error';
}

interface AppState {
  currentUser: any | null; // using any to match ClientUser temporarily
  isAdmin: boolean;
  savedPropertyIds: string[];
  
  toast: ToastState;
  
  setCurrentUser: (user: any | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setSavedPropertyIds: (ids: string[]) => void;
  
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  isAdmin: false,
  savedPropertyIds: [],
  
  toast: { message: null, type: 'success' },
  
  setCurrentUser: (user) => set({ currentUser: user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setSavedPropertyIds: (ids) => set({ savedPropertyIds: ids }),
  
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      set((state) => (state.toast.message === message ? { toast: { message: null, type: 'success' } } : state));
    }, 4000);
  },
  hideToast: () => set({ toast: { message: null, type: 'success' } }),
}));
