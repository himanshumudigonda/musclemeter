import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GymPlan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
  is_popular: boolean;
}

export interface GymCreationData {
  // Step 1: Name
  name: string;
  description: string;
  
  // Step 2: Location
  address: string;
  location_lat: number | null;
  location_lng: number | null;
  
  // Step 3: Photos
  photos: File[];
  photoUrls: string[];
  
  // Step 4: Plans & UPI
  upi_id: string;
  max_capacity: number;
  amenities: string[];
  plans: GymPlan[];
}

interface CreationStore {
  currentStep: number;
  data: GymCreationData;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<GymCreationData>) => void;
  addPlan: (plan: GymPlan) => void;
  removePlan: (id: string) => void;
  addPhoto: (file: File) => void;
  removePhoto: (index: number) => void;
  reset: () => void;
}

const initialData: GymCreationData = {
  name: "",
  description: "",
  address: "",
  location_lat: null,
  location_lng: null,
  photos: [],
  photoUrls: [],
  upi_id: "",
  max_capacity: 50,
  amenities: [],
  plans: [],
};

export const useCreationStore = create<CreationStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      data: initialData,

      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, 4) 
      })),
      
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 1) 
      })),
      
      updateData: (partial) => set((state) => ({
        data: { ...state.data, ...partial }
      })),
      
      addPlan: (plan) => set((state) => ({
        data: { ...state.data, plans: [...state.data.plans, plan] }
      })),
      
      removePlan: (id) => set((state) => ({
        data: { 
          ...state.data, 
          plans: state.data.plans.filter((p) => p.id !== id) 
        }
      })),
      
      addPhoto: (file) => {
        const url = URL.createObjectURL(file);
        set((state) => ({
          data: {
            ...state.data,
            photos: [...state.data.photos, file],
            photoUrls: [...state.data.photoUrls, url],
          }
        }));
      },
      
      removePhoto: (index) => set((state) => {
        const newPhotos = [...state.data.photos];
        const newUrls = [...state.data.photoUrls];
        URL.revokeObjectURL(newUrls[index]);
        newPhotos.splice(index, 1);
        newUrls.splice(index, 1);
        return {
          data: { ...state.data, photos: newPhotos, photoUrls: newUrls }
        };
      }),
      
      reset: () => set({ currentStep: 1, data: initialData }),
    }),
    {
      name: "gym-creation-store",
      partialize: (state) => ({
        currentStep: state.currentStep,
        data: {
          ...state.data,
          photos: [], // Don't persist File objects
          photoUrls: [],
        },
      }),
    }
  )
);
