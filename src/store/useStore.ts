import { create } from 'zustand';
import { Property } from '../types';

interface AppState {
  currentView: string;
  selectedProperty: Property | null;
  savedPropertyIds: string[];
  toastMessage: string | null;
  toastType: "success" | "error" | "info";
  setToast: (message: string, type: "success" | "error" | "info") => void;
  clearToast: () => void;
}

export const useStore = create<AppState>((set) => ({
  currentView: 'home',
  selectedProperty: null,
  savedPropertyIds: [],
  toastMessage: null,
  toastType: 'info',
  
  setToast: (message, type) => set({ toastMessage: message, toastType: type }),
  clearToast: () => set({ toastMessage: null })
}));
