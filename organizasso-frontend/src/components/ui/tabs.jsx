import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

function Tabs({
  className,
  style,
  ...props
}) {
  const tabsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    ...style,
  };
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      style={tabsStyle}
      className={className}
      {...props} />
  );
}

function TabsList({
  className,
  style,
  ...props
}) {
  const listStyle = {
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
    display: "inline-flex",
    height: "2.5rem",
    width: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
    padding: "0.25rem",
    ...style,
  };
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      style={listStyle}
      className={className}
      {...props} />
  );
}

function TabsTrigger({
  className,
  style,
  ...props
}) {
  const triggerStyle = {
    display: 'inline-flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    borderRadius: '0.5rem',
    border: '1px solid transparent',
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    cursor: 'pointer',
    ...style
  };
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      style={triggerStyle}
      className={className}
      {...props}
    />
  );
}

function TabsContent({
  className,
  style,
  ...props
}) {
  const contentStyle = {
    flex: "1",
    outline: "none",
    ...style,
  };
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      style={contentStyle}
      className={className}
      {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
