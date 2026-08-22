import { supabase } from '../supabaseClient';

export const hotspotsService = {
  async filter(params = {}) {
    let query = supabase.from('hotspots').select('*');
    
    Object.entries(params).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from('hotspots')
      .insert([data])
      .select()
      .single();
      
    if (error) throw error;
    return result;
  },

  async update(id, updates) {
    const { data: result, error } = await supabase
      .from('hotspots')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return result;
  },

  async delete(id) {
    const { error } = await supabase.from('hotspots').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
