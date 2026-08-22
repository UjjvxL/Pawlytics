import { supabase } from '../supabaseClient';

const createCrudService = (tableName) => ({
  async filter(params = {}) {
    let query = supabase.from(tableName).select('*');
    Object.entries(params).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  async create(data) {
    const { data: result, error } = await supabase.from(tableName).insert([data]).select().single();
    if (error) throw error;
    return result;
  },
  async update(id, updates) {
    const { data: result, error } = await supabase.from(tableName).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return result;
  },
  async delete(id) {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    return true;
  }
});

export const wardsService = createCrudService('wards');
export const alertsService = createCrudService('alerts');
export const verificationsService = createCrudService('verifications');
export const authorityActionsService = createCrudService('authority_actions');
export const contextPOIsService = createCrudService('context_pois');
export const usersService = createCrudService('users');

export { reportsService } from './reports';
export { hotspotsService } from './hotspots';
export { authService } from './auth';
