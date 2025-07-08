import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, UserCheck, UserX, Settings, FileUp, FileDown, Search, Loader2, Sun, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { employeeApi, absenceApi } from '@/lib/api';
import * as XLSX from 'xlsx';
import { getEmployeesOnLeaveToday } from '@/utils/absenceUtils';
import { Phone } from 'lucide-react';


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
const today = new Date().toISOString().split('T')[0]; // تأكد من نفس التنسيق

const StatCard = ({ icon, title, value, color }) => (
  <Card className="bg-card border-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
    </CardContent>
  </Card>
);

const ActionButton = ({ icon, label, path, onClick, navigate, disabled = false }) => (
  <motion.div whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }}>
    <Button
      variant="outline"
      className="w-full h-24 flex flex-col gap-2 justify-center text-base"
      onClick={() => path ? navigate(path) : onClick()}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </Button>
  </motion.div>
);

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    totalEmployees: 0, 
    presentToday: 0, 
    absentToday: 0, 
    leavesToday: 0 
  });
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const employees = await employeeApi.getAll();
      const absences = await absenceApi.getAll(); // تغيير هنا لنجلب كل السجلات
      
      const absentIds = new Set(
        absences
          .filter(a => a.registration_type === 'غياب')
          .filter(absence => {
            const today = new Date().toISOString().split('T')[0];
            const startDate = absence.start_date;
            const endDate = absence.end_date || absence.start_date;
            return today >= startDate && today <= endDate;
          })
          .map(a => a.employee_id)
      );
  
      const leavesToday = getEmployeesOnLeaveToday(absences); // استخدام الدالة المشتركة
  
      setStats({ 
        totalEmployees: employees.length, 
        absentToday: absentIds.size, 
        presentToday: employees.length - absentIds.size,
        leavesToday // استخدام القيمة المحسوبة
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في تحميل البيانات",
        description: error.message || "فشل في جلب البيانات من الخادم"
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({ 
        title: "الرجاء إدخال قيمة للبحث", 
        variant: "destructive" 
      });
      return;
    }
    navigate(`/employees?search=${searchQuery}`);
  };

  const handleExport = async () => {
    try {
      const employees = await employeeApi.getAll();
      const worksheet = XLSX.utils.json_to_sheet(employees);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
      XLSX.writeFile(workbook, "بيانات_الموظفين.xlsx");
      toast({ 
        title: "نجاح", 
        description: "تم تصدير البيانات بنجاح." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "خطأ", 
        description: "فشل تصدير البيانات." 
      });
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        let json = XLSX.utils.sheet_to_json(worksheet);
  
        const results = await Promise.allSettled(
          json.map(employee => employeeApi.add(employee))
        );
  
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
  
        toast({
          title: "تم الاستيراد",
          description: `تمت معالجة ${json.length} سجل: ${successful} نجاح, ${failed} فشل`
        });
  
        fetchStats();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "خطأ في الاستيراد",
          description: error.message || "حدث خطأ أثناء معالجة الملف"
        });
      } finally {
        event.target.value = '';
      }
    };
  
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل قراءة الملف"
      });
    };
  
    reader.readAsArrayBuffer(file);
  };

  const processImport = async (data) => {
    setImporting(true);
    try {
      const results = await Promise.allSettled(
        data.map(employee => employeeApi.add(employee))
      );
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${successful} سجل بنجاح، وفشل ${failed}`
      });
      fetchStats();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في الاستيراد",
        description: error.message || "حدث خطأ أثناء معالجة البيانات"
      });
    } finally {
      setImporting(false);
    }
  };

  const statCards = [
    { 
      // icon: <Users className="h-4 w-4 text-muted-foreground" />, 
      // title: 'إجمالي الموظفين', 
      // value: stats.totalEmployees, 
      // color: '#8b5cf6' 
    },
    { 
      // icon: <UserCheck className="h-4 w-4 text-muted-foreground" />, 
      // title: 'الحاضرون اليوم', 
      // value: stats.totalEmployees-stats.absentToday-stats.leavesToday, 
      // color: '#22c55e' 
    },
    { 
      // icon: <UserX className="h-4 w-4 text-muted-foreground" />, 
      // title: 'الغائبون اليوم', 
      // value: stats.absentToday, 
      // color: '#ef4444' 
    },
    { 
      // icon: <Sun className="h-4 w-4 text-muted-foreground" />, 
      // title: 'الإجازات اليوم', 
      // value: stats.leavesToday, 
      // color: '#f59e0b' 
    },
  ];

  const mainActions = [
    { 
      icon: <Users className="h-6 w-6" />, 
      label: 'تسجيل بيانات الموظفين', 
      path: '/employees' 
    },
    { 
      icon: <FileText className="h-6 w-6" />, 
      label: 'المطبوعات والتقارير', 
      path: '/reports' 
    },
    { 
      icon: <Settings className="h-6 w-6" />, 
      label: 'إعدادات النظام', 
      path: '/settings' 
    },
  ];

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-4 flex-grow">
        <Helmet>
          <title>لوحة التحكم - نظام إدارة شؤون العاملين</title>
        </Helmet>

        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-8"
        >
          لوحة التحكم
        </motion.h1>

        {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div> */}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات السريعة</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {mainActions.map((action, index) => (
                <ActionButton
                  key={index}
                  {...action}
                  navigate={navigate}
                />
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>البحث السريع عن موظف</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="ابحث بالاسم أو الرقم القومي..."
                    className="pr-4 pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button className="mt-4 w-full" onClick={handleSearch}>
                  بحث
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التعامل مع ملفات Excel</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImport}
                  style={{ display: 'none' }}
                  accept=".xlsx, .xls"
                />
                <ActionButton
                  icon={importing ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileUp className="h-6 w-6" />}
                  label={importing ? "جاري الاستيراد..." : "استيراد من Excel"}
                  onClick={() => fileInputRef.current.click()}
                  disabled={importing}
                />
                <ActionButton
                  icon={<FileDown className="h-6 w-6" />}
                  label="تصدير إلى Excel"
                  onClick={handleExport}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {previewData && (
          <Dialog open={!!previewData} onOpenChange={(open) => !open && setPreviewData(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>معاينة البيانات قبل الاستيراد</DialogTitle>
              </DialogHeader>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary">
                      {Object.keys(previewData[0]).map(key => (
                        <th key={key} className="text-right p-2 border">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-secondary/50'}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="p-2 border">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-sm text-muted-foreground">
                  عرض {Math.min(5, previewData.length)} من أصل {previewData.length} سجل
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewData(null)}>
                  إلغاء
                </Button>
                <Button onClick={() => {
                  processImport(previewData);
                  setPreviewData(null);
                }}>
                  تأكيد الاستيراد
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-500 dark:bg-gray-900 py-4 mt-auto">
        <div className="container mx-auto px-4 text-white-600 text-center text-sm text-white-600 dark:text-gray-400">
          <p >جميع الحقوق محفوظة لمدرسة الشهيد المقدم محمد عبداللاه صالح الصناعية العسكرية المشتركة 2025</p>
          <p className="mt-1 text-lg flex items-center justify-center gap-1 text-blue-200 dark:text-blue-400">
      خاص مستر علاء فريد - <Phone className="h-4 w-4 text-blue-600 dark:text-red-400" /> 01009209003
    </p>       </div>
      </footer>
    </div>
  );
};

export default Dashboard;
