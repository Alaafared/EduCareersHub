import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { absenceApi, employeeApi } from '@/lib/api';
import { PlusCircle, Edit, Trash2, ChevronDown, Calendar, AlertTriangle, Sun, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getEmployeesOnLeaveToday } from '@/utils/absenceUtils';

const AbsenceEditForm = ({ absence, employees, onSave, onCancel }) => {
  const [editData, setEditData] = useState(absence);
  const [startDate, setStartDate] = useState(absence.start_date ? new Date(absence.start_date) : null);
  const [endDate, setEndDate] = useState(absence.end_date ? new Date(absence.end_date) : null);

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date, field) => {
    if (field === 'start_date') {
      setStartDate(date);
      handleInputChange('start_date', date ? date.toISOString().split('T')[0] : '');
    } else {
      setEndDate(date);
      handleInputChange('end_date', date ? date.toISOString().split('T')[0] : '');
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-employee_id" className="text-foreground">الموظف *</Label>
        <Select value={editData.employee_id} onValueChange={(value) => handleInputChange('employee_id', value)}>
          <SelectTrigger id="edit-employee_id" className="form-input">
            <SelectValue placeholder="اختر الموظف" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto relative">
            <div className="max-h-[280px] overflow-y-auto pr-2">
              {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>)}
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1 pt-2 bg-gradient-to-t from-background to-transparent pointer-events-none">
              <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
            </div>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="edit-registration_type" className="text-foreground">نوع التسجيل *</Label>
        <Select value={editData.registration_type} onValueChange={(value) => handleInputChange('registration_type', value)}>
          <SelectTrigger id="edit-registration_type" className="form-input">
            <SelectValue placeholder="اختر نوع التسجيل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="غياب">غياب</SelectItem>
            <SelectItem value="إجازة">إجازة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {editData.registration_type === 'إجازة' && (
        <div>
          <Label htmlFor="edit-leave_type" className="text-foreground">نوع الإجازة *</Label>
          <Select value={editData.leave_type} onValueChange={(value) => handleInputChange('leave_type', value)}>
            <SelectTrigger id="edit-leave_type" className="form-input">
              <SelectValue placeholder="اختر نوع الإجازة" />
            </SelectTrigger>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-start_date" className="text-foreground">من تاريخ *</Label>
          <div className="relative">
            <DatePicker
              id="edit-start_date"
              selected={startDate}
              onChange={(date) => handleDateChange(date, 'start_date')}
              dateFormat="yyyy-MM-dd"
              placeholderText="اختر التاريخ"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              showYearDropdown
              dropdownMode="select"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-end_date" className="text-foreground">إلى تاريخ</Label>
          <div className="relative">
            <DatePicker
              id="edit-end_date"
              selected={endDate}
              onChange={(date) => handleDateChange(date, 'end_date')}
              dateFormat="yyyy-MM-dd"
              placeholderText="اختر التاريخ"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              showYearDropdown
              dropdownMode="select"
              minDate={startDate}
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button onClick={() => onSave(editData)} className="btn-gradient">حفظ التغييرات</Button>
      </div>
    </div>
  );
};

const Absences = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    registration_type: 'غياب',
    leave_type: '',
    start_date: '',
    end_date: '',
    
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingAbsence, setEditingAbsence] = useState(null);

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

  const absenceRecords = absences.filter(record => record.registration_type === 'غياب');
  const leaveRecords = absences.filter(record => record.registration_type === 'إجازة');

  const getEmployeesAbsentToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return absenceRecords.filter(absence => {
      const startDate = absence.start_date;
      const endDate = absence.end_date || absence.start_date;
      return today >= startDate && today <= endDate;
    }).length;
  }, [absenceRecords]);

  const getEmployeesOnLeaveToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return leaveRecords.filter(leave => {
      const startDate = leave.start_date;
      const endDate = leave.end_date || leave.start_date;
      return today >= startDate && today <= endDate;
    }).length;
  }, [leaveRecords]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleDateChange = (date, field) => {
    if (field === 'start_date') {
      setStartDate(date);
      handleInputChange({ target: { id: 'start_date', value: date ? date.toISOString().split('T')[0] : '' } });
    } else {
      setEndDate(date);
      handleInputChange({ target: { id: 'end_date', value: date ? date.toISOString().split('T')[0] : '' } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.start_date) {
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
        registration_type: 'غياب',
        leave_type: '',
        start_date: '',
        end_date: '',
      });
      setStartDate(null);
      setEndDate(null);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تسجيل البيانات." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAbsence = async (updatedAbsence) => {
    try {
      await absenceApi.update(updatedAbsence.id, updatedAbsence);
      toast({ title: "نجاح", description: "تم تحديث سجل الغياب/الإجازة بنجاح." });
      fetchAbsences();
      setEditingAbsence(null);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحديث البيانات." });
    }
  };

  const handleDeleteAbsence = async (absenceId) => {
    try {
      await absenceApi.delete(absenceId);
      toast({ title: "نجاح", description: "تم حذف سجل الغياب/الإجازة بنجاح." });
      fetchAbsences();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حذف البيانات." });
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateEmployeeStats = (employeeId) => {
    if (!employeeId) return { absenceDays: 0, leaveDays: 0 };
    
    const employeeAbsences = absenceRecords.filter(a => a.employee_id === employeeId);
    const employeeLeaves = leaveRecords.filter(a => a.employee_id === employeeId);
    
    const calculateDays = (records) => {
      return records.reduce((total, record) => {
        const start = new Date(record.start_date);
        const end = new Date(record.end_date || record.start_date);
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
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow container mx-auto p-4">
        <Helmet>
          <title>الغياب والإجازات - نظام إدارة شؤون العاملين</title>
        </Helmet>
        
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">إدارة الغياب والإجازات</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-600 dark:text-red-300">
                      الغياب اليوم
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-300">
                      {getEmployeesAbsentToday()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      عدد الموظفين في غياب اليوم
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-600 dark:text-green-300">
                      الإجازات اليوم
                    </CardTitle>
                    <Sun className="h-4 w-4 text-green-600 dark:text-green-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                      {getEmployeesOnLeaveToday()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      عدد الموظفين في إجازة اليوم
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>اختر موظف لمعرفة عدد أيام الغياب والإجازات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Select onValueChange={handleEmployeeSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر موظفا من القائمة" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto relative">
                      <div className="max-h-[240px] overflow-y-auto pr-2">
                        {filteredEmployees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </SelectItem>
                        ))}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1 pt-2 bg-gradient-to-t from-background to-transparent pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
                      </div>
                    </SelectContent>
                  </Select>
                </div>
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
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto relative">
                        <div className="max-h-[280px] overflow-y-auto pr-2">
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                          ))}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1 pt-2 bg-gradient-to-t from-background to-transparent pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
                        </div>
                      </SelectContent>
                    </Select>
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
                      <div className="relative">
                        <DatePicker
                          id="start_date"
                          selected={startDate}
                          onChange={(date) => handleDateChange(date, 'start_date')}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="اختر التاريخ"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          showYearDropdown
                          dropdownMode="select"
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">إلى تاريخ</Label>
                      <div className="relative">
                        <DatePicker
                          id="end_date"
                          selected={endDate}
                          onChange={(date) => handleDateChange(date, 'end_date')}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="اختر التاريخ"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          showYearDropdown
                          dropdownMode="select"
                          minDate={startDate}
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
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
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">
                              {absence.start_date} - {absence.end_date || absence.start_date}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                              onClick={() => setEditingAbsence(absence)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-effect text-foreground">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف سجل الغياب هذا؟
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteAbsence(absence.id)} 
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">
                              {leave.start_date} - {leave.end_date || leave.start_date}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                              onClick={() => setEditingAbsence(leave)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-effect text-foreground">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف سجل الإجازة هذا؟
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteAbsence(leave.id)} 
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

        <Dialog open={!!editingAbsence} onOpenChange={(open) => !open && setEditingAbsence(null)}>
          <DialogContent className="sm:max-w-md glass-effect text-foreground">
            <DialogHeader>
              <DialogTitle>تعديل سجل الغياب/الإجازة</DialogTitle>
            </DialogHeader>
            {editingAbsence && (
              <AbsenceEditForm 
                absence={editingAbsence} 
                employees={employees}
                onSave={handleUpdateAbsence} 
                onCancel={() => setEditingAbsence(null)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-500 dark:bg-gray-900 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p className="text-white-600 dark:text-white-400">
            جميع الحقوق محفوظة لمدرسة الشهيد المقدم محمد عبداللاه صالح الصناعية العسكرية المشتركة 2025
          </p>
          <p className="mt-1 text-lg flex items-center justify-center gap-1 text-blue-200 dark:text-blue-400">
            خاص مستر علاء فريد - <Phone className="h-4 w-4 text-blue-600 dark:text-red-400" /> 01009209003
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Absences;
