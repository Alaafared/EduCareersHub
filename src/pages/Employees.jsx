import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { employeeApi } from '@/lib/api';
import EmployeePageHeader from '@/components/EmployeePageHeader';
import EmployeeCardHeader from '@/components/EmployeeCardHeader';
import EmployeeFormTabs from '@/components/EmployeeFormTabs';
import { useLocation } from 'react-router-dom';
import { Phone } from 'lucide-react';

const initialEmployeeState = { 
  national_id: '', full_name: '', birth_date: '', marital_status: '', phone: '', 
  address: '', qualification: '', qualification_year: '', qualification_date: '', 
  teaching_subject: '', cadre_specialization: '', current_basic_salary: '', 
  previous_basic_salary: '', current_financial_grade: '', current_financial_grade_date: '', 
  previous_financial_grade: '', previous_financial_grade_date: '', teacher_code: '', 
  job_on_cadre: '', is_specialist: false, decision_number: '', decision_date: '', 
  appointment_date: '', school_join_date: '', contract_birth_date: '', group_type: '', 
  specialized_jobs: '', last_workplace: '', school_type: '' 
};

const prepareDataForSupabase = (data) => {
  const cleanedData = { ...data };
  delete cleanedData.id; 
  delete cleanedData.created_at; 
  delete cleanedData.user_id;
  
  for (const key in cleanedData) { 
    if (cleanedData[key] === '' || cleanedData[key] === undefined) cleanedData[key] = null; 
  }
  
  const numericFields = ['qualification_year', 'current_basic_salary', 'previous_basic_salary'];
  numericFields.forEach(field => { 
    if (cleanedData[field] !== null) { 
      const num = Number(cleanedData[field]); 
      cleanedData[field] = isNaN(num) ? null : num; 
    } 
  });
  
  const dateFields = [
    'birth_date', 'qualification_date', 'current_financial_grade_date', 
    'previous_financial_grade_date', 'decision_date', 'appointment_date', 
    'school_join_date', 'contract_birth_date'
  ];
  
  dateFields.forEach(field => { 
    if (cleanedData[field] && !/^\d{4}-\d{2}-\d{2}$/.test(cleanedData[field])) {
      cleanedData[field] = null; 
    }
  });
  
  return cleanedData;
};

const Employees = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(-1);
  const [formData, setFormData] = useState(initialEmployeeState);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "خطأ", 
        description: "فشل في جلب بيانات الموظفين." 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    setSearchQuery(query);
  }, [location.search]);

  useEffect(() => {
    const filtered = searchQuery
      ? employees.filter(emp => 
          emp.full_name?.includes(searchQuery) || 
          emp.national_id?.includes(searchQuery))
      : employees;
      
    setFilteredEmployees(filtered);
    
    if (filtered.length > 0) {
      setCurrentEmployeeIndex(0);
    } else {
      setCurrentEmployeeIndex(-1);
      setFormData(initialEmployeeState);
    }
  }, [searchQuery, employees]);

  useEffect(() => {
    if (currentEmployeeIndex >= 0 && filteredEmployees[currentEmployeeIndex]) {
      const currentEmployee = filteredEmployees[currentEmployeeIndex];
      const sanitizedData = {};
      
      for (const key in initialEmployeeState) {
        sanitizedData[key] = currentEmployee[key] === null ? '' : currentEmployee[key];
      }
      
      setFormData({ ...sanitizedData, id: currentEmployee.id });
    } else {
      setFormData(initialEmployeeState);
    }
  }, [currentEmployeeIndex, filteredEmployees]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };
  
  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleCheckboxChange = (id, checked) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };

  const handleSave = async () => {
    if (!formData.national_id || !formData.full_name) {
      toast({ 
        variant: "destructive", 
        title: "خطأ", 
        description: "الرقم القومي والاسم الكامل حقول إلزامية." 
      });
      return;
    }
    
    setLoading(true);
    const dataToSave = prepareDataForSupabase(formData);
    
    try {
      let savedEmployee;
      if (formData.id) {
        savedEmployee = await employeeApi.update(formData.id, dataToSave);
      } else {
        savedEmployee = await employeeApi.add(dataToSave);
      }
      
      toast({ 
        title: "نجاح", 
        description: "تم حفظ بيانات الموظف بنجاح." 
      });
      
      await fetchEmployees();
      
      setTimeout(() => {
        setEmployees(prevEmployees => {
          const newIndex = prevEmployees.findIndex(emp => emp.id === savedEmployee.id);
          if (newIndex !== -1) setCurrentEmployeeIndex(newIndex);
          return prevEmployees;
        });
      }, 0);
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "خطأ", 
        description: error.message.includes('duplicate key') 
          ? "الرقم القومي موجود بالفعل." 
          : "فشل في حفظ البيانات." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentEmployeeIndex(-1);
    setFormData(initialEmployeeState);
    toast({ 
      title: "جاهز للإدخال", 
      description: "يمكنك الآن إضافة موظف جديد." 
    });
  };

  const handleDelete = async () => {
    if (currentEmployeeIndex === -1 || !formData.id) return;
    
    setLoading(true);
    try {
      await employeeApi.delete(formData.id);
      toast({ 
        title: "نجاح", 
        description: "تم حذف الموظف بنجاح." 
      });
      fetchEmployees();
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "خطأ", 
        description: "فشل في حذف الموظف." 
      });
    } finally { 
      setLoading(false); 
    }
  };

  const navigateEmployees = (direction) => {
    if (filteredEmployees.length === 0) return;
    
    let newIndex = currentEmployeeIndex + direction;
    if (newIndex < 0) newIndex = filteredEmployees.length - 1;
    if (newIndex >= filteredEmployees.length) newIndex = 0;
    setCurrentEmployeeIndex(newIndex);
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-grow container mx-auto ${isMobile ? 'px-2' : 'px-4'} py-4`}>
        <Helmet>
          <title>شؤون العاملين - نظام الإدارة</title>
          <meta name="description" content="إدارة بيانات الموظفين." />
        </Helmet>
        
        <div className="space-y-4 md:space-y-6">
          <EmployeePageHeader 
            onSave={handleSave} 
            onAddNew={handleAddNew} 
            onDelete={handleDelete} 
            loading={loading} 
            hasData={!!formData.id} 
            employeeName={formData.full_name} 
            isMobile={isMobile}
          />
          
          <Card className={isMobile ? 'border-0 shadow-none' : ''}>
            <EmployeeCardHeader 
              onNavigate={navigateEmployees} 
              employeeCount={filteredEmployees.length} 
              currentIndex={currentEmployeeIndex} 
              canNavigate={filteredEmployees.length > 1} 
              onSearch={setSearchQuery} 
              initialQuery={searchQuery} 
              isMobile={isMobile}
            />
            <CardContent className={isMobile ? 'p-2' : 'p-6'}>
              <EmployeeFormTabs 
                formData={formData} 
                handleInputChange={handleInputChange} 
                handleSelectChange={handleSelectChange} 
                handleCheckboxChange={handleCheckboxChange} 
                isMobile={isMobile}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Responsive Footer Section */}
      <footer className="bg-gray-500 dark:bg-gray-900 py-4 mt-auto">
        <div className={`container mx-auto ${isMobile ? 'px-2' : 'px-4'} text-center text-sm`}>
          <p className="text-white-600 dark:text-white-400">
            جميع الحقوق محفوظة لمدرسة الشهيد المقدم محمد عبداللاه صالح الصناعية العسكرية المشتركة 2025
          </p>
          <p className={`mt-1 ${isMobile ? 'text-sm' : 'text-lg'} flex items-center justify-center gap-1 text-blue-200 dark:text-blue-400`}>
            خاص مستر علاء فريد - <Phone className="h-4 w-4 text-blue-600 dark:text-red-400" /> 01009209003
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Employees;
