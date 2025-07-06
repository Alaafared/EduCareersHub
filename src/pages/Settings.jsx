import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatabaseBackup, Upload, Trash2, KeyRound, Save, Image, Palette } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { schoolSettingsApi, employeeApi, absenceApi } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import * as XLSX from 'xlsx';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const backupInputRef = useRef(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await schoolSettingsApi.get();
      if (data) {
        setSettings(data);
        if (data.logo_url) setLogoPreview(data.logo_url);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في جلب الإعدادات." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e) => setSettings(prev => ({ ...prev, [e.target.id]: e.target.value }));

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let updatedSettings = { ...settings };
      if (logoFile) {
        const logoUrl = await schoolSettingsApi.uploadLogo(logoFile);
        updatedSettings.logo_url = logoUrl;
      }
      await schoolSettingsApi.save(updatedSettings);
      toast({ title: "نجاح", description: "تم حفظ الإعدادات بنجاح." });
      fetchSettings();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ الإعدادات." });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const employees = await employeeApi.getAll();
      const absences = await absenceApi.getAll();
      const settings = await schoolSettingsApi.get();

      const workbook = XLSX.utils.book_new();
      const empSheet = XLSX.utils.json_to_sheet(employees);
      const absSheet = XLSX.utils.json_to_sheet(absences);
      const setSheet = XLSX.utils.json_to_sheet([settings]);

      XLSX.utils.book_append_sheet(workbook, empSheet, "Employees");
      XLSX.utils.book_append_sheet(workbook, absSheet, "Absences");
      XLSX.utils.book_append_sheet(workbook, setSheet, "Settings");

      XLSX.writeFile(workbook, `نسخة_احتياطية_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast({ title: "نجاح", description: "تم إنشاء النسخة الاحتياطية بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إنشاء النسخة الاحتياطية." });
    }
  };

  const handleRestoreBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setLoading(true);
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Restore Employees
        if (workbook.SheetNames.includes("Employees")) {
          const empSheet = workbook.Sheets["Employees"];
          const employees = XLSX.utils.sheet_to_json(empSheet);
          for (const emp of employees) await employeeApi.add(emp);
        }

        // Restore Absences
        if (workbook.SheetNames.includes("Absences")) {
          const absSheet = workbook.Sheets["Absences"];
          const absences = XLSX.utils.sheet_to_json(absSheet);
          for (const abs of absences) await absenceApi.add(abs);
        }

        // Restore Settings
        if (workbook.SheetNames.includes("Settings")) {
          const setSheet = workbook.Sheets["Settings"];
          const settingsData = XLSX.utils.sheet_to_json(setSheet);
          if (settingsData.length > 0) await schoolSettingsApi.save(settingsData[0]);
        }
        
        toast({ title: "نجاح", description: "تم استعادة النسخة الاحتياطية." });
        fetchSettings();
      } catch (error) {
        toast({ variant: "destructive", title: "خطأ", description: "فشل في استعادة النسخة الاحتياطية." });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const handleClearData = async () => {
    try {
      const employees = await employeeApi.getAll();
      for (const emp of employees) await employeeApi.delete(emp.id);
      toast({ title: "تم تفريغ البيانات", description: "تم حذف جميع بيانات العاملين بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حذف البيانات." });
    }
  };
  
  return (
    <>
      <Helmet>
        <title>الإعدادات - نظام إدارة شؤون العاملين</title>
        <meta name="description" content="إدارة إعدادات النظام والبيانات." />
      </Helmet>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">إعدادات البرنامج</h1>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>بيانات المدرسة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="manager_name">اسم المدير</Label><Input id="manager_name" value={settings.manager_name || ''} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="admin_name">اسم الإدارة</Label><Input id="admin_name" value={settings.admin_name || ''} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="school_name">اسم المدرسة</Label><Input id="school_name" value={settings.school_name || ''} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="school_code">كود المدرسة</Label><Input id="school_code" value={settings.school_code || ''} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="academic_year">العام الدراسي</Label><Input id="academic_year" value={settings.academic_year || ''} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label htmlFor="deputy_manager">وكيل شؤون العاملين</Label><Input id="deputy_manager" value={settings.deputy_manager || ''} onChange={handleInputChange} /></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo-upload">شعار المدرسة</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && <img-replace src={logoPreview} alt="شعار المدرسة" className="w-20 h-20 rounded-md object-cover" />}
                  <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="max-w-xs"/>
                </div>
              </div>
              <Button onClick={handleSave} disabled={loading}><Save className="ml-2 h-4 w-4" /> حفظ البيانات</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>إدارة البيانات والمظهر</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <input type="file" ref={backupInputRef} onChange={handleRestoreBackup} style={{ display: 'none' }} accept=".xlsx, .xls" />
              <Button className="w-full justify-start gap-3" variant="outline" onClick={handleCreateBackup}><DatabaseBackup className="h-5 w-5 text-green-500" /> إنشاء نسخة احتياطية</Button>
              <Button className="w-full justify-start gap-3" variant="outline" onClick={() => backupInputRef.current.click()}><Upload className="h-5 w-5 text-blue-500" /> استرجاع نسخة احتياطية</Button>
              <Button className="w-full justify-start gap-3" variant="outline" onClick={toggleTheme}><Palette className="h-5 w-5 text-purple-500" /> تغيير المظهر</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button className="w-full justify-start gap-3" variant="destructive"><Trash2 className="h-5 w-5" /> تفريغ البيانات وحذف العاملين</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle><AlertDialogDescription>هذا الإجراء سيحذف كل بيانات العاملين والإجازات بشكل دائم.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={handleClearData}>نعم، قم بالحذف</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Settings;