export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "athlete" | "owner";
export type BookingStatus = "pending" | "approved" | "rejected" | "expired";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          avatar_url: string | null;
          email: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          avatar_url?: string | null;
          email: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          avatar_url?: string | null;
          email?: string;
          phone?: string | null;
          updated_at?: string;
        };
      };
      gyms: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          address: string;
          location_lat: number;
          location_lng: number;
          upi_id: string;
          current_crowd_count: number;
          max_capacity: number;
          photos: string[];
          amenities: string[];
          opening_hours: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          address: string;
          location_lat: number;
          location_lng: number;
          upi_id: string;
          current_crowd_count?: number;
          max_capacity: number;
          photos?: string[];
          amenities?: string[];
          opening_hours?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_id?: string;
          name?: string;
          description?: string | null;
          address?: string;
          location_lat?: number;
          location_lng?: number;
          upi_id?: string;
          current_crowd_count?: number;
          max_capacity?: number;
          photos?: string[];
          amenities?: string[];
          opening_hours?: Json;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          description: string | null;
          price: number;
          duration_days: number;
          features: string[];
          is_popular: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          name: string;
          description?: string | null;
          price: number;
          duration_days: number;
          features?: string[];
          is_popular?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          gym_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          duration_days?: number;
          features?: string[];
          is_popular?: boolean;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          gym_id: string;
          plan_id: string;
          amount: number;
          transaction_id_utr: string | null;
          status: BookingStatus;
          start_date: string | null;
          end_date: string | null;
          qr_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          gym_id: string;
          plan_id: string;
          amount: number;
          transaction_id_utr?: string | null;
          status?: BookingStatus;
          start_date?: string | null;
          end_date?: string | null;
          qr_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          gym_id?: string;
          plan_id?: string;
          amount?: number;
          transaction_id_utr?: string | null;
          status?: BookingStatus;
          start_date?: string | null;
          end_date?: string | null;
          qr_code?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      booking_status: BookingStatus;
    };
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Gym = Database["public"]["Tables"]["gyms"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];

// Extended types with relations
export interface GymWithPlans extends Gym {
  plans: Plan[];
  owner: Profile;
}

export interface BookingWithDetails extends Booking {
  gym: Gym;
  plan: Plan;
  user: Profile;
}
