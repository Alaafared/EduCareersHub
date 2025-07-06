import { supabase } from '@/lib/customSupabaseClient';

const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const employeeApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  add: async (employeeData) => {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    if (!employeeData.full_name || !employeeData.national_id) {
      throw new Error('الاسم الكامل والرقم القومي حقول مطلوبة');
    }
    const { data, error } = await supabase.from('employees').insert([{ ...employeeData, user_id: user.id }]).select();
    if (error) throw error;
    return data[0];
  },
  
  update: async (id, updatedEmployee) => {
    const { data, error } = await supabase.from('employees').update(updatedEmployee).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  
  delete: async (id) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
  },
  
  search: async (query) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .or(`full_name.ilike.%${query}%,national_id.ilike.%${query}%,teacher_code.ilike.%${query}%`);
    if (error) throw error;
    return data;
  },
};

export const absenceApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('absences').select('*');
    if (error) throw error;
    return data;
  },
  
  getTodayStats: async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: employees } = await supabase.from('employees').select('id');
    const totalEmployees = employees.length;

    const { data: absences } = await supabase
      .from('absences')
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today);

    const absentToday = absences.filter(a => a.registration_type === 'غياب').length;
    const leavesToday = absences.filter(a => a.registration_type === 'إجازة').length;

    return {
      totalEmployees,
      absentToday,
      leavesToday
    };
  },
  
  add: async (absenceData) => {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    if (!absenceData.employee_id || !absenceData.start_date) {
      throw new Error('بيانات الغياب ناقصة');
    }
    const { data, error } = await supabase.from('absences').insert([{ ...absenceData, user_id: user.id }]).select();
    if (error) throw error;
    return data[0];
  },
  
  getByEmployeeId: async (employeeId) => {
    const { data, error } = await supabase.from('absences').select('*').eq('employee_id', employeeId);
    if (error) throw error;
    return data;
  },

  getByDateRange: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('absences')
      .select('*')
      .gte('start_date', startDate)
      .lte('end_date', endDate);
    if (error) throw error;
    return data;
  },
  
  update: async (id, updatedAbsence) => {
    const { data, error } = await supabase
      .from('absences')
      .update(updatedAbsence)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
  
  delete: async (id) => {
    const { error } = await supabase
      .from('absences')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export const schoolSettingsApi = {
  get: async () => {
    const { data, error } = await supabase.from('school_settings').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },
  
  save: async (settingsData) => {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');
    
    const existingSettings = await schoolSettingsApi.get();
    
    const payload = { ...settingsData, user_id: user.id };
    
    let data, error;
    if (existingSettings) {
      ({ data, error } = await supabase.from('school_settings').update(payload).eq('user_id', user.id).select());
    } else {
      ({ data, error } = await supabase.from('school_settings').insert([payload]).select());
    }
    
    if (error) throw error;
    return data[0];
  },

  uploadLogo: async (file) => {
    const user = await getUser();
    if (!user) throw new Error('User not authenticated');

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('school_logos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('school_logos')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};