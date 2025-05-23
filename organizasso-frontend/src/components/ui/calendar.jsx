"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import styles from './styles/calendar.module.css'; // Import CSS module

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  const baseClassNames = {
    months: styles.months || "",
    month: styles.month || "",
    caption: styles.caption || "",
    caption_label: styles.caption_label || "",
    nav: styles.nav || "",
    nav_button: styles.nav_button || "",
    nav_button_previous: styles.nav_button_previous || "",
    nav_button_next: styles.nav_button_next || "",
    table: styles.table || "",
    head_row: styles.head_row || "",
    head_cell: styles.head_cell || "",
    row: styles.row || "",
    cell: styles.cell || "",
    day: styles.day || "",
    day_range_start: styles.day_range_start || "",
    day_range_end: styles.day_range_end || "",
    day_selected: styles.day_selected || "",
    day_today: styles.day_today || "",
    day_outside: styles.day_outside || "",
    day_disabled: styles.day_disabled || "",
    day_range_middle: styles.day_range_middle || "",
    day_hidden: styles.day_hidden || "",
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={`${styles.calendar} ${className || ''}`.trim()}
      classNames={{ ...baseClassNames, ...classNames }}
      components={{
        IconLeft: ({ className: iconClassName, ...iconProps }) => (
          <ChevronLeft
            className={`${styles.calendarIcon} ${iconClassName || ''}`.trim()}
            {...iconProps}
          />
        ),
        IconRight: ({ className: iconClassName, ...iconProps }) => (
          <ChevronRight
            className={`${styles.calendarIcon} ${iconClassName || ''}`.trim()}
            {...iconProps}
          />
        ),
      }}
      {...props} />
  );
}

export { Calendar }
