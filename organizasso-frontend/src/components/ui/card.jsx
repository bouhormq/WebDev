import * as React from "react"
import styles from './styles/card.module.css'; // Import CSS module

function Card({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={`${styles.card} ${className || ''}`.trim()}
      {...props} />
  );
}

function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={`${styles.header} ${className || ''}`.trim()}
      {...props} />
  );
}

function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={`${styles.title} ${className || ''}`.trim()}
      {...props} />
  );
}

function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={`${styles.description} ${className || ''}`.trim()}
      {...props} />
  );
}

function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={`${styles.action} ${className || ''}`.trim()}
      {...props} />
  );
}

function CardContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-content"
      className={`${styles.content} ${className || ''}`.trim()}
      {...props} />
  );
}

function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={`${styles.footer} ${className || ''}`.trim()}
      {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
