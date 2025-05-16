import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

function Avatar({
  className,
  style,
  ...props
}) {
  const avatarStyle = {
    position: "relative",
    display: "flex",
    height: "2rem",
    width: "2rem",
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: "9999px",
    ...style,
  };
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      style={avatarStyle}
      className={className}
      {...props} />
  );
}

function AvatarImage({
  className,
  style,
  ...props
}) {
  const imageStyle = {
    aspectRatio: "1 / 1",
    height: "100%",
    width: "100%",
    ...style,
  };
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      style={imageStyle}
      className={className}
      {...props} />
  );
}

function AvatarFallback({
  className,
  style,
  ...props
}) {
  const fallbackStyle = {
    backgroundColor: "var(--muted)",
    display: "flex",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9999px",
    ...style,
  };
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      style={fallbackStyle}
      className={className}
      {...props} />
  );
}

export { Avatar, AvatarImage, AvatarFallback }
