import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { absenceApi, employeeApi } from '@/lib/api';
import { PlusCircle, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Absences = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    educational_stage: '',
    registration_type: 'غياب',
    leave_type: '',
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في جلب الموظفين." });
    }
  }, [toast]);

  const fetchAbsences = useCallback(async () => {
    try {
      const data = await absenceApi.getAll();
      setAbsences(data);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في جلب سجلات الغياب." });
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
    fetchAbsences();
  }, [fetchEmployees, fetchAbsences]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.start_date || !formData.end_date) {
      toast({ variant: "destructive", title: "خطأ", description: "الرجاء ملء الحقول الإلزامية." });
      return;
    }
    setLoading(true);
    try {
      await absenceApi.add(formData);
      toast({ title: "نجاح", description: "تم تسجيل الغياب/الإجازة بنجاح." });
      fetchAbsences();
      setFormData({
        employee_id: '',
        educational_stage: '',
        registration_type: 'غياب',
        leave_type: '',
        start_date: '',
        end_date: '',
      });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تسجيل البيانات." });
    } finally {
      setLoading(false);
    }
  };

  // تصفية الموظفين حسب البحث
  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تصفية السجلات حسب النوع
  const absenceRecords = absences.filter(record => record.registration_type === 'غياب');
  const leaveRecords = absences.filter(record => record.registration_type === 'إجازة');

  // حساب إحصائيات الموظف المحدد
  const calculateEmployeeStats = (employeeId) => {
    if (!employeeId) return { absenceDays: 0, leaveDays: 0 };
    
    const employeeAbsences = absenceRecords.filter(a => a.employee_id === employeeId);
    const employeeLeaves = leaveRecords.filter(a => a.employee_id === employeeId);
    
    const calculateDays = (records) => {
      return records.reduce((total, record) => {
        const start = new Date(record.start_date);
        const end = new Date(record.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return total + diffDays;
      }, 0);
    };
    
    return {
      absenceDays: calculateDays(employeeAbsences),
      leaveDays: calculateDays(employeeLeaves),
    };
  };

  const handleEmployeeSelect = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    setSelectedEmployee(emp);
  };

  const employeeStats = selectedEmployee ? calculateEmployeeStats(selectedEmployee.id) : null;

  return (
    <>
      <Helmet>
        <title>الغياب والإجازات - نظام إدارة شؤون العاملين</title>
        <meta name="description" content="تسجيل وإدارة غياب وإجازات الموظفين." />
      </Helmet>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">إدارة الغياب والإجازات</h1>
        
        {/* شريط البحث وعرض الإحصائيات */}
        <Card>
          <CardHeader>
            <CardTitle>اختر موظف لمعرفة عدد أيام الغياب والإجازات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Select onValueChange={handleEmployeeSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر موظفا من القائمة" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {filteredEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedEmployee && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Card className="bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
                      أيام الغياب
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-300">
                      {employeeStats.absenceDays} يوم
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
                      أيام الإجازات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                      {employeeStats.leaveDays} يوم
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>تسجيل غياب أو إجازة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">الموظف</Label>
                  <Select dir="rtl" value={formData.employee_id} onValueChange={(value) => handleSelectChange('employee_id', value)}>
                    <SelectTrigger><SelectValue placeholder="اختر الموظف" /></SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="educational_stage">المرحلة التعليمية</Label>
                  <Input id="educational_stage" value={formData.educational_stage} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_type">نوع التسجيل</Label>
                  <Select dir="rtl" value={formData.registration_type} onValueChange={(value) => handleSelectChange('registration_type', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="غياب">غياب</SelectItem>
                      <SelectItem value="إجازة">إجازة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.registration_type === 'إجازة' && (
                  <div className="space-y-2">
                    <Label htmlFor="leave_type">نوع الإجازة</Label>
                    <Select dir="rtl" value={formData.leave_type} onValueChange={(value) => handleSelectChange('leave_type', value)}>
                      <SelectTrigger><SelectValue placeholder="اختر نوع الإجازة" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="عارضة">عارضة</SelectItem>
                        <SelectItem value="مرضية">مرضية</SelectItem>
                        <SelectItem value="اعتيادية">اعتيادية</SelectItem>
                        <SelectItem value="طارئة">طارئة</SelectItem>
                        <SelectItem value="أمومة">أمومة</SelectItem>
                        <SelectItem value="حج">حج</SelectItem>
                        <SelectItem value="دراسية">دراسية</SelectItem>
                     </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">من تاريخ</Label>
                    <Input id="start_date" type="date" value={formData.start_date} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">إلى تاريخ</Label>
                    <Input id="end_date" type="date" value={formData.end_date} onChange={handleInputChange} />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  <PlusCircle className="ml-2 h-4 w-4" /> {loading ? 'جاري التسجيل...' : 'تسجيل'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>سجل الغياب والإجازات</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="absence" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="absence">سجل الغياب</TabsTrigger>
                  <TabsTrigger value="leave">سجل الإجازات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="absence" className="max-h-96 overflow-y-auto">
                  <div className="space-y-2 mt-4">
                    {absenceRecords.map(absence => (
                      <div key={absence.id} className="flex justify-between items-center p-2 rounded-md bg-secondary/50">
                        <div>
                          <p className="font-semibold">{employees.find(e => e.id === absence.employee_id)?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{absence.registration_type}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {absence.start_date} - {absence.end_date}
                        </div>
                      </div>
                    ))}
                    {absenceRecords.length === 0 && <p className="text-center text-muted-foreground">لا توجد سجلات غياب.</p>}
                  </div>
                </TabsContent>
                
                <TabsContent value="leave" className="max-h-96 overflow-y-auto">
                  <div className="space-y-2 mt-4">
                    {leaveRecords.map(leave => (
                      <div key={leave.id} className="flex justify-between items-center p-2 rounded-md bg-secondary/50">
                        <div>
                          <p className="font-semibold">{employees.find(e => e.id === leave.employee_id)?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{leave.registration_type} - {leave.leave_type}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {leave.start_date} - {leave.end_date}
                        </div>
                      </div>
                    ))}
                    {leaveRecords.length === 0 && <p className="text-center text-muted-foreground">لا توجد سجلات إجازات.</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Absences;