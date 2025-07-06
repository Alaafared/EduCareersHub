
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  FileText, 
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Building2
} from 'lucide-react';
import { employeeStorage, absenceStorage, schoolStorage } from '@/utils/storage';
import { generateDailyStrengthReport, generateWeeklyReport } from '@/utils/reportUtils';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    totalReports: 0
  });

 
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [schoolData, setSchoolData] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const employees = employeeStorage.getAll();
    const today = new Date().toISOString().split('T')[0];
    const dailyReport = generateDailyStrengthReport(today);
    const weekly = generateWeeklyReport();
    const school = schoolStorage.get();

    setStats({
      totalEmployees: employees.length,
      presentToday: dailyReport.presentEmployees,
      absentToday: dailyReport.absentEmployees,
      totalReports: 8 // Number of available reports
    });

    setWeeklyReport(weekly);
    setSchoolData(school);
  };

  const statCards = [
    { 
      icon: <Users className="h-4 w-4 text-muted-foreground" />, 
      title: 'إجمالي الموظفين', 
      value: stats.totalEmployees, 
      color: '#8b5cf6' 
    },
    { 
      icon: <UserCheck className="h-4 w-4 text-muted-foreground" />, 
      title: 'الحاضرون اليوم', 
      value: stats.presentToday, 
      color: '#22c55e' 
    },
    { 
      icon: <UserX className="h-4 w-4 text-muted-foreground" />, 
      title: 'الغائبون اليوم (بدون إجازات)', 
      value: stats.absentWithoutLeave,  // سيحتاج لتعديل في حالة state
      color: '#ef4444' 
    },
    { 
      icon: <CalendarX className="h-4 w-4 text-muted-foreground" />,  // استخدم أيقونة مناسبة للإجازات
      title: 'إجازات اليوم', 
      value: stats.todayLeaves,  // سيحتاج لتعديل في حالة state
      color: '#f59e0b' 
    },
  ];

  const quickActions = [
    {
      title: 'إضافة موظف جديد',
      description: 'تسجيل بيانات موظف جديد',
      icon: Users,
      color: 'from-blue-600 to-purple-600'
    },
    {
      title: 'تسجيل غياب',
      description: 'تسجيل غياب أو إجازة موظف',
      icon: Calendar,
      color: 'from-green-600 to-blue-600'
    },
    {
      title: 'إنشاء تقرير',
      description: 'إنشاء تقرير جديد',
      icon: FileText,
      color: 'from-purple-600 to-pink-600'
    },
    {
      title: 'إعدادات المدرسة',
      description: 'تحديث بيانات المدرسة',
      icon: Building2,
      color: 'from-orange-600 to-red-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          لوحة التحكم الرئيسية
        </h1>
        <p className="text-white/70 text-lg">
          مرحباً بك في نظام إدارة شؤون العاملين
        </p>
        {schoolData.schoolName && (
          <p className="text-white/60 mt-2">
            {schoolData.schoolName} - {schoolData.administrationName}
          </p>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stats-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                </div>
                <div className={`w-16 h-16 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className={`h-2 bg-gradient-to-r ${card.color} rounded-full mt-4`} />
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Report Summary */}
      {weeklyReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            إحصائيات الأسبوع الماضي
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{weeklyReport.totalAbsences}</p>
              <p className="text-white/70 text-sm">إجمالي الغيابات</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{weeklyReport.presentEmployees}</p>
              <p className="text-white/70 text-sm">متوسط الحضور</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {Object.keys(weeklyReport.absencesByType || {}).length}
              </p>
              <p className="text-white/70 text-sm">أنواع الإجازات</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-effect rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          الإجراءات السريعة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="glass-effect rounded-lg p-4 card-hover cursor-pointer group"
                onClick={() => {
                  // This would trigger navigation to the respective page
                  console.log(`Navigate to ${action.title}`);
                }}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                <p className="text-white/60 text-sm">{action.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-effect rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="h-5 w-5" />
          النشاط الأخير
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">تم إضافة موظف جديد</p>
              <p className="text-white/60 text-sm">منذ ساعتين</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">تم تسجيل إجازة مرضية</p>
              <p className="text-white/60 text-sm">منذ 4 ساعات</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">تم إنشاء تقرير شهري</p>
              <p className="text-white/60 text-sm">أمس</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
  
};


export default Dashboard;
