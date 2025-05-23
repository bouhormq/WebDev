import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import styles from './styles/alert-dialog.module.css'; // Import CSS module

function AlertDialog({
  ...props
}) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}) {
  return (<AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />);
}

function AlertDialogPortal({
  ...props
}) {
  return (<AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />);
}

function AlertDialogOverlay({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={`${styles.overlayStyle} ${className || ''}`.trim()}
      {...props} />
  );
}

function AlertDialogContent({
  className,
  ...props
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={`${styles.contentStyle} ${className || ''}`.trim()}
        {...props} />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={`${styles.headerStyle} ${className || ''}`.trim()}
      {...props} />
  );
}

function AlertDialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={`${styles.footerStyle} ${className || ''}`.trim()}
      {...props} />
  );
}

function AlertDialogTitle({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={`${styles.titleStyle} ${className || ''}`.trim()}
      {...props} />
  );
}

function AlertDialogDescription({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={`${styles.descriptionStyle} ${className || ''}`.trim()}
      {...props} />
  );
}

function AlertDialogAction({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Action
      className={`${styles.actionStyle} ${className || ''}`.trim()}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Cancel
      className={`${styles.cancelStyle} ${className || ''}`.trim()}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
