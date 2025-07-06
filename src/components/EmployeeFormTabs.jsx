import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FormField = ({ id, label, type = "text", options = [], formData, handleInputChange, handleSelectChange }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {type === "select" ? (
      <Select dir="rtl" value={formData[id] || ''} onValueChange={(value) => handleSelectChange(id, value)}>
        <SelectTrigger id={id}><SelectValue placeholder={`اختر ${label}`} /></SelectTrigger>
        <SelectContent>
          {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
        </SelectContent>
      </Select>
    ) : (
      <Input id={id} type={type} value={formData[id] || ''} onChange={handleInputChange} placeholder={label} />
    )}
  </div>
);

const EmployeeFormTabs = ({ formData, handleInputChange, handleSelectChange, handleCheckboxChange }) => {
  const formFieldProps = { formData, handleInputChange, handleSelectChange };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">بيانات عامة</TabsTrigger>
        <TabsTrigger value="qualification">بيانات المؤهل</TabsTrigger>
        <TabsTrigger value="financial">بيانات مالية</TabsTrigger>
        <TabsTrigger value="functional">بيانات وظيفية</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField {...formFieldProps} id="national_id" label="الرقم القومي" />
        <FormField {...formFieldProps} id="full_name" label="الاسم الكامل" />
        <FormField {...formFieldProps} id="birth_date" label="تاريخ الميلاد" type="date" />
        <FormField {...formFieldProps} id="marital_status" label="الحالة الاجتماعية" type="select" options={[{value: 'أعزب', label: 'أعزب'}, {value: 'متزوج', label: 'متزوج'}, {value: 'غير ذلك', label: 'غير ذلك'}]} />
        <FormField {...formFieldProps} id="phone" label="رقم الهاتف" type="tel" />
        <FormField {...formFieldProps} id="address" label="العنوان" />
      </TabsContent>
      <TabsContent value="qualification" className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField {...formFieldProps} id="qualification" label="المؤهل الدراسي" type="select" options={[{value: 'بكالوريوس', label: 'بكالوريوس'}, {value: 'ماجستير', label: 'ماجستير'}, {value: 'دكتوراه', label: 'دكتوراه'}]} />
        <FormField {...formFieldProps} id="qualification_year" label="سنة الحصول عليه" />
        <FormField {...formFieldProps} id="qualification_date" label="تاريخ الحصول عليه" type="date" />
        <FormField {...formFieldProps} id="teaching_subject" label="المادة التي يدرسها" />
        <FormField {...formFieldProps} id="cadre_specialization" label="مادة التخصص على الكادر" />
      </TabsContent>
      <TabsContent value="financial" className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField {...formFieldProps} id="current_basic_salary" label="الأساسي الحالي" />
        <FormField {...formFieldProps} id="previous_basic_salary" label="الأساسي السابق" />
        <FormField {...formFieldProps} id="current_financial_grade" label="الدرجة المالية الحالية" type="select" options={[{value: 'الأولى', label: 'الأولى'}, {value: 'الثانية', label: 'الثانية'}]} />
        <FormField {...formFieldProps} id="current_financial_grade_date" label="تاريخ الحصول عليها" type="date" />
        <FormField {...formFieldProps} id="previous_financial_grade" label="الدرجة المالية السابقة" type="select" options={[{value: 'الأولى', label: 'الأولى'}, {value: 'الثانية', label: 'الثانية'}]} />
        <FormField {...formFieldProps} id="previous_financial_grade_date" label="تاريخ الحصول عليها" type="date" />
      </TabsContent>
      <TabsContent value="functional" className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField {...formFieldProps} id="teacher_code" label="كود المعلم" />
        <FormField {...formFieldProps} id="job_on_cadre" label="الوظيفة على الكادر" type="select" options={[{value: 'معلم', label: 'معلم'}, {value: 'معلم أول', label: 'معلم أول'}]} />
        <div className="flex items-center space-x-2 pt-8">
          <Checkbox id="is_specialist" checked={formData.is_specialist} onCheckedChange={(checked) => handleCheckboxChange('is_specialist', checked)} />
          <Label htmlFor="is_specialist">أخصائي</Label>
        </div>
        <FormField {...formFieldProps} id="decision_number" label="رقم القرار" />
        <FormField {...formFieldProps} id="decision_date" label="تاريخ القرار" type="date" />
        <FormField {...formFieldProps} id="appointment_date" label="تاريخ التعيين" type="date" />
        <FormField {...formFieldProps} id="school_join_date" label="تاريخ تواجده بالمدرسة" type="date" />
        <FormField {...formFieldProps} id="contract_birth_date" label="تاريخ الميلاد للتعاقد" type="date" />
        <FormField {...formFieldProps} id="group_type" label="المجموعة النوعية" />
        <FormField {...formFieldProps} id="specialized_jobs" label="الوظائف التخصصية للتعليم" type="select" options={[{value: 'أخصائي', label: 'أخصائي'}, {value: 'مدرس', label: 'مدرس'}, {value: 'إداري', label: 'إداري'}]} />
        <FormField {...formFieldProps} id="last_workplace" label="آخر جهة عمل" />
        <FormField {...formFieldProps} id="school_type" label="الأنواع في المدرسة" type="select" options={[{value: 'حكومي', label: 'حكومي'}, {value: 'خاص', label: 'خاص'}]} />
      </TabsContent>
    </Tabs>
  );
};

export default EmployeeFormTabs;