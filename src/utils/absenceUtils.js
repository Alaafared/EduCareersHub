export const getEmployeesOnLeaveToday = (absences) => {
  const today = new Date().toISOString().split('T')[0];
  return absences
    .filter(record => record.registration_type === 'إجازة')
    .filter(leave => {
      const startDate = leave.start_date;
      const endDate = leave.end_date || leave.start_date;
      return today >= startDate && today <= endDate;
    }).length;
};

export const getAbsenceStats = (absences, startDate, endDate) => {
  const result = {
    totalAbsence: 0,
    totalLeave: 0,
    dailyStats: {}
  };

  // تحويل تواريخ البداية والنهاية إلى كائنات تاريخ
  const start = new Date(startDate);
  const end = new Date(endDate);

  absences.forEach(absence => {
    if (!absence || !absence.start_date) return;
    
    const absenceStart = new Date(absence.start_date);
    const absenceEnd = new Date(absence.end_date || absence.start_date);
    
    // تحقق إذا كانت الفترة تتقاطع مع النطاق المطلوب
    if (absenceEnd >= start && absenceStart <= end) {
      if (absence.registration_type === 'غياب') {
        result.totalAbsence++;
      } else if (absence.registration_type === 'إجازة') {
        result.totalLeave++;
      }

      // حساب الإحصائيات اليومية
      const currentDate = new Date(Math.max(absenceStart, start));
      const lastDate = new Date(Math.min(absenceEnd, end));
      
      while (currentDate <= lastDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        if (!result.dailyStats[dateStr]) {
          result.dailyStats[dateStr] = {
            absence: 0,
            leave: 0
          };
        }

        if (absence.registration_type === 'غياب') {
          result.dailyStats[dateStr].absence++;
        } else if (absence.registration_type === 'إجازة') {
          result.dailyStats[dateStr].leave++;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });

  return result;
};

export const getTodayAbsenceStats = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data: absences, error } = await supabase
    .from('absences')
    .select('*')
    .lte('start_date', today)
    .gte('end_date', today);
  
  if (error) throw error;
  
  const absentToday = absences.filter(a => a.registration_type === 'غياب').length;
  const leavesToday = absences.filter(a => a.registration_type === 'إجازة').length;
  
  return {
    absentToday,
    leavesToday
  };
};