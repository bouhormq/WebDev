import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { ChevronDownIcon } from "lucide-react"
import styles from './styles/navigation-menu.module.css'; // Import CSS module

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={`${styles.navigationMenu} ${className || ''}`.trim()}
      {...props}>
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={`${styles.navigationMenuList} ${className || ''}`.trim()}
      {...props} />
  );
}

function NavigationMenuItem({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={`${styles.navigationMenuItem} ${className || ''}`.trim()}
      {...props} />
  );
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={`${styles.navigationMenuTrigger} ${className || ''}`.trim()}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon className={styles.navigationMenuTriggerIcon} aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={`${styles.navigationMenuContent} ${className || ''}`.trim()}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}) {
  return (
    <div className={styles.navigationMenuViewportWrapper}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={`${styles.navigationMenuViewport} ${className || ''}`.trim()}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={`${styles.navigationMenuLink} ${className || ''}`.trim()}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={`${styles.navigationMenuIndicator} ${className || ''}`.trim()}
      {...props}
    >
      <div className={styles.navigationMenuIndicatorArrow} />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
