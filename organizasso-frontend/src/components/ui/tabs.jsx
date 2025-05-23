import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import styles from './styles/tabs.module.css'

function Tabs({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={`${styles.tabs} ${className || ''}`.trim()}
      {...props} />
  );
}

function TabsList({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={`${styles.tabsList} ${className || ''}`.trim()}
      {...props} />
  );
}

function TabsTrigger({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={`${styles.tabsTrigger} ${className || ''}`.trim()}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={`${styles.tabsContent} ${className || ''}`.trim()}
      {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
