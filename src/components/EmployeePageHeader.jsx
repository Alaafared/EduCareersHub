import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, PlusCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EmployeePageHeader = ({ onSave, onAddNew, onDelete, loading, hasData, employeeName }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">تسجيل بيانات الموظفين</h1>
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={loading}><Save className="ml-2 h-4 w-4" /> حفظ</Button>
        <Button variant="outline" onClick={onAddNew} disabled={loading}><PlusCircle className="ml-2 h-4 w-4" /> إضافة جديد</Button>
        {hasData && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loading}><Trash2 className="ml-2 h-4 w-4" /> حذف</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                <AlertDialogDescription>
                  هذا الإجراء سيقوم بحذف الموظف "{employeeName}" بشكل نهائي.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>تأكيد الحذف</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default EmployeePageHeader;