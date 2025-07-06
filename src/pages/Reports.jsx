import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Printer, Calendar as CalendarIcon, Phone } from 'lucide-react';
import { employeeApi, absenceApi } from '@/lib/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const format = (date, formatStr) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = num => num.toString().padStart(2, '0');
  
  return formatStr
    .replace('yyyy', d.getFullYear())
    .replace('MM', pad(d.getMonth() + 1))
    .replace('dd', pad(d.getDate()));
};

const Reports = () => {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [reportTitle, setReportTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const reportRef = useRef();

  const reportsList = [
    { id: 'all_employees', name: "كشف بجميع الموظفين", qualifications: null },
    { id: 'weekly_absence', name: "إحصاء الأسبوع الأخير", qualifications: null },
    { id: 'daily_absence', name: "حصر غياب اليوم الحالي", qualifications: null },
    { id: 'absence_by_date', name: "تقرير الغياب حسب التاريخ", qualifications: null },
  ];

  const exportToExcel = (data, fileName) => {
    if (!data || data.length === 0) {
      toast({ title: "لا توجد بيانات", description: "لا توجد بيانات لإنشاء هذا التقرير." });
      return;
    }
    try {
      // const worksheet = XLSX.utils.json_to_sheet(data);
      // const workbook = XLSX.utils.book_new();
      // XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      // XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: `فشل في إنشاء ملف Excel: ${error.message}` });
    }
  };

  const handlePrint = () => {
    if (!reportData || reportData.length === 0) {
      toast({ title: "لا توجد بيانات", description: "لا توجد بيانات للطباعة." });
      return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #2c3e50; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <table>
            <thead>
              <tr>
                ${Object.keys(reportData[0]).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${reportData.map(row => `
                <tr>
                  ${Object.values(row).map(value => `<td>${value || '-'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportToPDF = async () => {
    if (!reportData || reportData.length === 0) {
      toast({ title: "لا توجد بيانات", description: "لا توجد بيانات لإنشاء ملف PDF." });
      return;
    }
  
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm'
      });
  
      doc.setFontSize(16);
      doc.text(reportTitle, doc.internal.pageSize.width / 2, 15, {
        align: 'center'
      });
  
      const headers = Object.keys(reportData[0]);
      const data = reportData.map(row => Object.values(row));
  
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 25,
        styles: {
          halign: 'center',
          font: 'ae_AlArabiya'
        },
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: 255
        }
      });
  
      doc.save(`${reportTitle}.pdf`);
      toast({ title: "نجاح", description: "تم إنشاء ملف PDF بنجاح." });
  
    } catch (error) {
      console.error('PDF Error:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء PDF",
        description: error.message || "حدث خطأ غير متوقع"
      });
    }
  };

  const generateAbsenceReportByDate = async () => {
    if (!startDate || !endDate) {
      toast({ title: "خطأ", description: "يجب اختيار تاريخ البداية والنهاية", variant: "destructive" });
      return;
    }
  
    setIsLoading(true);
    setShowDatePicker(false);
    
    try {
      const totalEmps = await employeeApi.getAll();
      const totalEmpCount = totalEmps.length;
      const allAbsences = await absenceApi.getAll();
  
      const dates = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
      const reportData = [];
      
      for (const date of dates) {
        const dayOfWeek = date.getDay(); // 0 للأحد، 6 للسبت
        
        // تخطي الجمعة (5) والسبت (6)
        if (dayOfWeek === 5 || dayOfWeek === 6) continue;
        
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // حساب الغياب اليومي
        const dailyAbsences = allAbsences.filter(absence => 
          absence.registration_type === 'غياب' && 
          dateStr >= absence.start_date && 
          dateStr <= (absence.end_date || absence.start_date)
        ).length;
        
        // حساب الإجازات اليومية
        const dailyLeaves = allAbsences.filter(leave => 
          leave.registration_type === 'إجازة' && 
          dateStr >= leave.start_date && 
          dateStr <= (leave.end_date || leave.start_date)
        ).length;
        
        reportData.push({
          'اليوم': daysOfWeek[dayOfWeek],
          'التاريخ': dateStr,
          'إجمالي الموظفين': totalEmpCount,
          'إجمالي الحضور': totalEmpCount - dailyAbsences - dailyLeaves,
          'إجمالي الغياب': dailyAbsences,
          'إجمالي الإجازات': dailyLeaves,
          'نسبة الغياب': totalEmpCount > 0 ? `${Math.round((dailyAbsences / totalEmpCount) * 100)}%` : '0%'
        });
      }
  
      setReportData(reportData);
      setReportTitle(`تقرير الغياب من ${format(startDate, 'yyyy-MM-dd')} إلى ${format(endDate, 'yyyy-MM-dd')}`);
      exportToExcel(reportData, `تقرير_الغياب_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`);
      
    } catch (error) {
      console.error('Error details:', error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب البيانات",
        description: error.message || "حدث خطأ غير متوقع"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportId, qualifications, reportName) => {
    if (reportId === 'absence_by_date') {
      setShowDatePicker(true);
      return;
    }

    setIsLoading(true);
    try {
      let data = [];
      let fileName = '';

      const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

      switch (reportId) {
        case 'all_employees':
          const allEmployees = await employeeApi.getAll();
          data = allEmployees.map(emp => ({
            'الاسم': emp.full_name,
            'الكود': emp.code,
            'الرقم القومي': emp.national_id,
            'تاريخ الميلاد': emp.birth_date,
            'التخصص': emp.specialization,
            'مادة التدريس': emp.teaching_subject,
            'رقم الهاتف': emp.phone_number,
            'العنوان': emp.address,
            'الحالة الاجتماعية': emp.marital_status
          }));
          fileName = 'جميع_الموظفين';
          break;
          
        case 'weekly_absence':
          const totalEmployees = await employeeApi.getAll();
          const totalCount = totalEmployees.length;
          
          const today = new Date();
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7);
          
          const weekData = [];
          const allAbsences = await absenceApi.getAll();
          
          let daysProcessed = 0;
          let currentDay = 0;
          
          while (daysProcessed < 5 && currentDay < 30) {
            const currentDate = new Date(oneWeekAgo);
            currentDate.setDate(oneWeekAgo.getDate() + currentDay);
            const dayOfWeek = currentDate.getDay();
            
            // تخطي الجمعة (5) والسبت (6)
            if (dayOfWeek !== 5 && dayOfWeek !== 6) {
              const dateStr = currentDate.toISOString().split('T')[0];
              
              const dailyAbsences = allAbsences.filter(absence => 
                absence.registration_type === 'غياب' && 
                dateStr >= absence.start_date && 
                dateStr <= (absence.end_date || absence.start_date)
              ).length;
              
              const dailyLeaves = allAbsences.filter(leave => 
                leave.registration_type === 'إجازة' && 
                dateStr >= leave.start_date && 
                dateStr <= (leave.end_date || leave.start_date)
              ).length;
              
              weekData.push({
                'اليوم': daysOfWeek[dayOfWeek],
                'التاريخ': dateStr,
                'إجمالي الموظفين': totalCount,
                'إجمالي الحضور': totalCount - dailyAbsences - dailyLeaves,
                'إجمالي الغياب': dailyAbsences,
                'إجمالي الإجازات': dailyLeaves,
                'نسبة الغياب': totalCount > 0 ? `${Math.round((dailyAbsences / totalCount) * 100)}%` : '0%'
              });
              
              daysProcessed++;
            }
            
            currentDay++;
          }
          
          data = weekData;
          fileName = 'إحصاء_غياب_الأسبوع_الأخير';
          break;

        case 'daily_absence':
          const todayDate = new Date();
          const dayOfWeek = todayDate.getDay();
          
          // إذا كان اليوم جمعة أو سبت، لا نعرض بيانات
          if (dayOfWeek === 5 || dayOfWeek === 6) {
            toast({ title: "اليوم عطلة", description: "لا يوجد بيانات للعرض اليوم (جمعة/سبت)" });
            setReportData([]);
            setIsLoading(false);
            return;
          }
          
          const dateStr = format(todayDate, 'yyyy-MM-dd');
          const allEmps = await employeeApi.getAll();
          const totalEmpCount = allEmps.length;
          
          const absences = await absenceApi.getAll();
          
          const todayAbsences = absences.filter(absence => 
            absence.registration_type === 'غياب' && 
            dateStr >= absence.start_date && 
            dateStr <= (absence.end_date || absence.start_date)
          ).length;
          
          const todayLeaves = absences.filter(leave => 
            leave.registration_type === 'إجازة' && 
            dateStr >= leave.start_date && 
            dateStr <= (leave.end_date || leave.start_date)
          ).length;
          
          data = [{
            'اليوم': daysOfWeek[dayOfWeek],
            'التاريخ': dateStr,
            'إجمالي الموظفين': totalEmpCount,
            'إجمالي الحضور': totalEmpCount - todayAbsences - todayLeaves,
            'إجمالي الغياب': todayAbsences,
            'إجمالي الإجازات': todayLeaves,
            'نسبة الغياب': totalEmpCount > 0 ? `${Math.round((todayAbsences / totalEmpCount) * 100)}%` : '0%'
          }];
          
          fileName = `حصر_غياب_${dateStr}`;
          break;

        default:
          toast({ title: `🚧 تقرير قيد الإنشاء`, description: "هذه الميزة غير مطبقة بعد!" });
          return;
      }

      setSelectedReport(reportId);
      setReportData(Array.isArray(data) ? data : []);
      setReportTitle(reportName);
      exportToExcel(data, fileName);

    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: `فشل في إنشاء التقرير: ${error.message}` });
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow container mx-auto p-4">
        <Helmet>
          <title>المطبوعات والتقارير - نظام إدارة شؤون العاملين</title>
          <meta name="description" content="إنشاء وعرض التقارير المختلفة." />
        </Helmet>
        
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">المطبوعات والتقارير</h1>
          <Card>
            <CardHeader>
              <CardTitle>التقارير المتاحة</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportsList.map((report) => (
                <Button
                  key={report.id}
                  variant="outline"
                  className="justify-start p-4 h-auto"
                  onClick={() => generateReport(report.id, report.qualifications, report.name)}
                  disabled={isLoading}
                >
                  <FileText className="ml-3 h-5 w-5 text-primary" />
                  <span className="text-right">{report.name}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>اختر نطاق التاريخ</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">من تاريخ</Label>
                  <div className="relative">
                    <DatePicker
                      id="start_date"
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="اختر التاريخ"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      showYearDropdown
                      dropdownMode="select"
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                    />
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">إلى تاريخ</Label>
                  <div className="relative">
                    <DatePicker
                      id="end_date"
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="اختر التاريخ"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      showYearDropdown
                      dropdownMode="select"
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                    />
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDatePicker(false)}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={generateAbsenceReportByDate}
                >
                  تأكيد
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {selectedReport && (
            <Card ref={reportRef}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{reportTitle}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint} disabled={reportData.length === 0}>
                      <Printer className="ml-2 h-4 w-4" />
                      طباعة
                    </Button>
                    {/* <Button variant="outline" onClick={exportToPDF} disabled={reportData.length === 0}>
                      <Printer className="ml-2 h-4 w-4" />
                      حفظ PDF
                    </Button> */}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-4">جاري تحميل البيانات...</p>
                ) : reportData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-800">
                          {Object.keys(reportData[0]).map((key) => (
                            <th key={key} className="border p-3 text-center text-white font-medium">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((row, index) => (
                          <tr 
                            key={index} 
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            {Object.values(row).map((value, i) => (
                              <td 
                                key={i} 
                                className="border p-3 text-center text-gray-800"
                              >
                                {value || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4">لا توجد بيانات متاحة لهذا التقرير</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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

export default Reports;