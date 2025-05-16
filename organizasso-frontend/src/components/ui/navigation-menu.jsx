import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { ChevronDownIcon } from "lucide-react"

function NavigationMenu({
  className,
  children,
  viewport = true,
  style,
  ...props
}) {
  const menuStyle = {
    position: "relative",
    display: "flex",
    maxWidth: "max-content",
    flex: "1",
    alignItems: "center",
    justifyContent: "center",
    ...style,
  };

  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      style={menuStyle}
      className={className}
      {...props}>
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  style,
  ...props
}) {
  const listStyle = {
    display: "flex",
    flex: "1",
    listStyle: "none",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    ...style,
  };

  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      style={listStyle}
      className={className}
      {...props} />
  );
}

function NavigationMenuItem({
  className,
  style,
  ...props
}) {
  const itemStyle = {
    position: "relative",
    ...style,
  };
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      style={itemStyle}
      className={className}
      {...props} />
  );
}

function NavigationMenuTrigger({
  className,
  children,
  style,
  ...props
}) {
  const triggerStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "0.5rem",
    cursor: "pointer",
    ...style,
  };
  const iconStyle = {
    position: "relative",
    top: "1px",
    marginLeft: "0.25rem",
    width: "0.75rem",
    height: "0.75rem",
    transition: "transform 0.3s ease-in-out",
  };

  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      style={triggerStyle}
      className={className}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon style={iconStyle} aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  style,
  ...props
}) {
  const contentStyle = {
    padding: "0.5rem 0.625rem",
    ...style,
  };
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      style={contentStyle}
      className={className}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  style,
  ...props
}) {
  const wrapperStyle = {
    position: "absolute",
    top: "100%",
    left: 0,
    zIndex: 50,
    display: "flex",
    justifyContent: "center",
  };
  const viewportStyle = {
    position: "relative",
    marginTop: "0.375rem",
    overflow: "hidden",
    borderRadius: "0.5rem",
    ...style,
  };

  return (
    <div style={wrapperStyle}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        style={viewportStyle}
        className={className}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  style,
  ...props
}) {
  const linkStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    padding: "0.5rem",
    fontSize: "0.875rem",
    borderRadius: "0.375rem",
    outline: "none",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
    ...style,
  };
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      style={linkStyle}
      className={className}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  style,
  ...props
}) {
  const indicatorStyle = {
    position: "relative",
    top: "100%",
    zIndex: 1,
    display: "flex",
    height: "0.375rem",
    alignItems: "flex-end",
    justifyContent: "center",
    overflow: "hidden",
    ...style,
  };
  const arrowStyle = {
    backgroundColor: "var(--border)",
    position: "relative",
    top: "60%",
    height: "0.5rem",
    width: "0.5rem",
    transform: "rotate(45deg)",
    borderTopLeftRadius: "2px",
    boxShadow: "var(--shadow-md)",
  };
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      style={indicatorStyle}
      className={className}
      {...props}
    >
      <div style={arrowStyle} />
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
