import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react';

const EmployeeCardHeader = ({ onNavigate, employeeCount, currentIndex, canNavigate, onSearch, initialQuery }) => {
  const [query, setQuery] = useState(initialQuery || '');

  useEffect(() => {
    setQuery(initialQuery || '');
  }, [initialQuery]);

  const handleSearch = () => {
    onSearch(query);
  };
  
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>بيانات الموظف</CardTitle>
      <div className="flex items-center gap-2">
        <Input 
          placeholder="بحث سريع..." 
          className="w-48" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="ghost" size="icon" onClick={handleSearch}><Search className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate(-1)} disabled={!canNavigate}><ChevronRight className="h-5 w-5" /></Button>
        <span>{employeeCount > 0 ? `${currentIndex + 1} / ${employeeCount}` : '0 / 0'}</span>
        <Button variant="ghost" size="icon" onClick={() => onNavigate(1)} disabled={!canNavigate}><ChevronLeft className="h-5 w-5" /></Button>
      </div>
    </CardHeader>
  );
};

export default EmployeeCardHeader;