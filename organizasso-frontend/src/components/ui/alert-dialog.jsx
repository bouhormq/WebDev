import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

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
  style,
  ...props
}) {
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    ...style,
  };
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      style={overlayStyle}
      className={className}
      {...props} />
  );
}

function AlertDialogContent({
  className,
  style,
  ...props
}) {
  const contentStyle = {
    backgroundColor: "var(--background)",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 50,
    display: "grid",
    width: "calc(100% - 2rem)",
    maxWidth: "32rem",
    gap: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--border)",
    padding: "1.5rem",
    boxShadow: "var(--shadow-lg)",
    ...style,
  };
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        style={contentStyle}
        className={className}
        {...props} />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  style,
  ...props
}) {
  const headerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    textAlign: "center",
    ...style,
  };
  return (
    <div
      data-slot="alert-dialog-header"
      style={headerStyle}
      className={className}
      {...props} />
  );
}

function AlertDialogFooter({
  className,
  style,
  ...props
}) {
  const footerStyle = {
    display: "flex",
    flexDirection: "column-reverse",
    gap: "0.5rem",
    ...style,
  };
  return (
    <div
      data-slot="alert-dialog-footer"
      style={footerStyle}
      className={className}
      {...props} />
  );
}

function AlertDialogTitle({
  className,
  style,
  ...props
}) {
  const titleStyle = {
    fontSize: "1.125rem",
    fontWeight: "600",
    ...style,
  };
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      style={titleStyle}
      className={className}
      {...props} />
  );
}

function AlertDialogDescription({
  className,
  style,
  ...props
}) {
  const descriptionStyle = {
    color: "var(--muted-foreground)",
    fontSize: "0.875rem",
    ...style,
  };
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      style={descriptionStyle}
      className={className}
      {...props} />
  );
}

function AlertDialogAction({
  className,
  style,
  ...props
}) {
  const actionStyle = {
    cursor: 'pointer',
    ...style
  };
  return (
    <AlertDialogPrimitive.Action
      style={actionStyle}
      className={className}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  style,
  ...props
}) {
  const cancelStyle = {
    cursor: 'pointer',
    ...style
  };
  return (
    <AlertDialogPrimitive.Cancel
      style={cancelStyle}
      className={className}
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
