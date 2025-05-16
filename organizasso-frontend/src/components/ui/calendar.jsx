"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  style,
  ...props
}) {
  const calendarStyle = {
    padding: "0.75rem",
    ...style,
  };

  const baseClassNames = {
    months: "",
    month: "",
    caption: "",
    caption_label: "",
    nav: "",
    nav_button: "",
    nav_button_previous: "",
    nav_button_next: "",
    table: "",
    head_row: "",
    head_cell: "",
    row: "",
    cell: "",
    day: "",
    day_range_start: "",
    day_range_end: "",
    day_selected: "",
    day_today: "",
    day_outside: "",
    day_disabled: "",
    day_range_middle: "",
    day_hidden: "",
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      style={calendarStyle}
      className={className}
      classNames={{ ...baseClassNames, ...classNames }}
      components={{
        IconLeft: ({ className: iconClassName, style: iconStyle, ...iconProps }) => (
          <ChevronLeft
            style={{ width: "1rem", height: "1rem", ...iconStyle }}
            className={iconClassName}
            {...iconProps}
          />
        ),
        IconRight: ({ className: iconClassName, style: iconStyle, ...iconProps }) => (
          <ChevronRight
            style={{ width: "1rem", height: "1rem", ...iconStyle }}
            className={iconClassName}
            {...iconProps}
          />
        ),
      }}
      {...props} />
  );
}

export { Calendar }
