import * as React from "react";
import { ar } from 'date-fns/locale';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = 'single',
  selected,
  onSelect,
  initialFocus,
  locale = ar,
  ...props
}) {
  return (
    <DayPicker
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      showOutsideDays={showOutsideDays}
      className="p-3 bg-white rounded-md shadow-md"
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md',
        day_selected: 'bg-gray-900 text-gray-50 hover:bg-gray-900 hover:text-gray-50 focus:bg-gray-900 focus:text-gray-50',
        day_today: 'bg-gray-100 text-gray-900',
        day_outside: 'text-gray-500 opacity-50',
        day_disabled: 'text-gray-500 opacity-50',
        day_range_middle: 'aria-selected:bg-gray-100 aria-selected:text-gray-900',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <span className="h-4 w-4">{"<"}</span>
        ),
        IconRight: ({ ...props }) => (
          <span className="h-4 w-4">{">"}</span>
        ),
      }}
      formatters={{
        formatCaption: (date, options) => {
          return format(date, 'LLLL yyyy', { locale: options?.locale });
        },
      }}
      locale={locale}
      initialFocus={initialFocus}
      {...props}
    />
  );
}