"use client"

import * as React from "react"

function Table({
  className,
  style,
  ...props
}) {
  const containerStyle = {
    position: "relative",
    width: "100%",
    overflowX: "auto",
  };
  const tableStyle = {
    width: "100%",
    captionSide: "bottom",
    fontSize: "0.875rem",
    ...style,
  };
  return (
    <div data-slot="table-container" style={containerStyle}>
      <table
        data-slot="table"
        style={tableStyle}
        className={className}
        {...props} />
    </div>
  );
}

function TableHeader({
  className,
  style,
  ...props
}) {
  const headerStyle = {
    ...style,
  };
  return (
    <thead
      data-slot="table-header"
      style={headerStyle}
      className={className}
      {...props} />
  );
}

function TableBody({
  className,
  style,
  ...props
}) {
  const bodyStyle = {
    ...style,
  };
  return (
    <tbody
      data-slot="table-body"
      style={bodyStyle}
      className={className}
      {...props} />
  );
}

function TableFooter({
  className,
  style,
  ...props
}) {
  const footerStyle = {
    backgroundColor: "var(--muted-alpha)",
    borderTop: "1px solid var(--border)",
    fontWeight: "500",
    ...style,
  };
  return (
    <tfoot
      data-slot="table-footer"
      style={footerStyle}
      className={className}
      {...props} />
  );
}

function TableRow({
  className,
  style,
  ...props
}) {
  const rowStyle = {
    transition: "colors 0.2s ease-in-out",
    ...style,
  };
  return (
    <tr
      data-slot="table-row"
      style={rowStyle}
      className={className}
      {...props} />
  );
}

function TableHead({
  className,
  style,
  ...props
}) {
  const headStyle = {
    color: "var(--foreground)",
    height: "3rem",
    padding: "0 1rem",
    textAlign: "left",
    verticalAlign: "middle",
    fontWeight: "500",
    whiteSpace: "nowrap",
    ...style,
  };
  return (
    <th
      data-slot="table-head"
      style={headStyle}
      className={className}
      {...props} />
  );
}

function TableCell({
  className,
  style,
  ...props
}) {
  const cellStyle = {
    padding: "1rem",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    ...style,
  };
  return (
    <td
      data-slot="table-cell"
      style={cellStyle}
      className={className}
      {...props} />
  );
}

function TableCaption({
  className,
  style,
  ...props
}) {
  const captionStyle = {
    color: "var(--muted-foreground)",
    marginTop: "1rem",
    fontSize: "0.875rem",
    ...style,
  };
  return (
    <caption
      data-slot="table-caption"
      style={captionStyle}
      className={className}
      {...props} />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
