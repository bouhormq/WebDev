import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
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
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      style={overlayStyle}
      className={className}
      {...props} />
  );
}

function DialogContent({
  className,
  children,
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

  const closeButtonStyle = {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    borderRadius: "0.25rem",
    opacity: 0.7,
    transition: "opacity 0.2s ease-in-out",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
  };
  const closeIconStyle = { width: "1rem", height: "1rem" };

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        style={contentStyle}
        className={className}
        {...props}>
        {children}
        <DialogPrimitive.Close style={closeButtonStyle}>
          <XIcon style={closeIconStyle} />
          <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: 0 }}>Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
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
      data-slot="dialog-header"
      style={headerStyle}
      className={className}
      {...props} />
  );
}

function DialogFooter({
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
      data-slot="dialog-footer"
      style={footerStyle}
      className={className}
      {...props} />
  );
}

function DialogTitle({
  className,
  style,
  ...props
}) {
  const titleStyle = {
    fontSize: "1.125rem",
    lineHeight: "1",
    fontWeight: "600",
    ...style,
  };
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      style={titleStyle}
      className={className}
      {...props} />
  );
}

function DialogDescription({
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
    <DialogPrimitive.Description
      data-slot="dialog-description"
      style={descriptionStyle}
      className={className}
      {...props} />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
