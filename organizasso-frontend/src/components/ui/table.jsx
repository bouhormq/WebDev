"use client"

import * as React from "react"
import styles from './styles/table.module.css'

function Table({
  className,
  ...props
}) {
  return (
    <div data-slot="table-container" className={styles.tableContainer}>
      <table
        data-slot="table"
        className={`${styles.table} ${className || ''}`.trim()}
        {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={`${styles.header} ${className || ''}`.trim()}
      {...props} />
  );
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={`${styles.body} ${className || ''}`.trim()}
      {...props} />
  );
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={`${styles.footer} ${className || ''}`.trim()}
      {...props} />
  );
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={`${styles.row} ${className || ''}`.trim()}
      {...props} />
  );
}

function TableHead({
  className,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      className={`${styles.head} ${className || ''}`.trim()}
      {...props} />
  );
}

function TableCell({
  className,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      className={`${styles.cell} ${className || ''}`.trim()}
      {...props} />
  );
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={`${styles.caption} ${className || ''}`.trim()}
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
