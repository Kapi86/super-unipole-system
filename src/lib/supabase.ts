import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're not using authentication for this app
  },
})

// Database helper functions
export const db = {
  // Units operations
  units: {
    async getAll() {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    async getByUnitId(unitId: string) {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('unit_id', unitId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    async create(unit: Omit<Database['public']['Tables']['units']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('units')
        .insert(unit)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<Database['public']['Tables']['units']['Update']>) {
      const { data, error } = await supabase
        .from('units')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },

    async bulkInsert(units: Database['public']['Tables']['units']['Insert'][]) {
      const { data, error } = await supabase
        .from('units')
        .insert(units)
        .select()
      
      if (error) throw error
      return data || []
    },

    async bulkUpsert(units: Database['public']['Tables']['units']['Insert'][]) {
      const { data, error } = await supabase
        .from('units')
        .upsert(units, { onConflict: 'unit_id' })
        .select()
      
      if (error) throw error
      return data || []
    }
  },

  // Campaigns operations
  campaigns: {
    async getAll() {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    async create(campaign: Omit<Database['public']['Tables']['campaigns']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaign)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: Partial<Database['public']['Tables']['campaigns']['Update']>) {
      const { data, error } = await supabase
        .from('campaigns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  // User settings operations
  settings: {
    async get() {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    async upsert(settings: Omit<Database['public']['Tables']['user_settings']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(settings)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }
}
