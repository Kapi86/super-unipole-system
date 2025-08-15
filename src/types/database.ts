// Database types for Supabase integration

export interface Database {
  public: {
    Tables: {
      units: {
        Row: {
          id: string
          unit_id: string
          location: string
          governorate: string
          lat_lng: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          location: string
          governorate: string
          lat_lng: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          location?: string
          governorate?: string
          lat_lng?: string
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          unit_ids: string[]
          export_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          unit_ids: string[]
          export_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          unit_ids?: string[]
          export_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          default_zoom: number
          default_center_lat: number
          default_center_lng: number
          preferred_governorate: string | null
          map_style: string
          marker_style: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          default_zoom?: number
          default_center_lat?: number
          default_center_lng?: number
          preferred_governorate?: string | null
          map_style?: string
          marker_style?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          default_zoom?: number
          default_center_lat?: number
          default_center_lng?: number
          preferred_governorate?: string | null
          map_style?: string
          marker_style?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
