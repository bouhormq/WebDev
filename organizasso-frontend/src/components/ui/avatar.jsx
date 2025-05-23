import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import styles from './styles/avatar.module.css'; // Import CSS module

function Avatar({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={`${styles.avatarStyle} ${className || ''}`.trim()}
      {...props} />
  );
}

function AvatarImage({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={`${styles.imageStyle} ${className || ''}`.trim()}
      {...props} />
  );
}

function AvatarFallback({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={`${styles.fallbackStyle} ${className || ''}`.trim()}
      {...props} />
  );
}

export { Avatar, AvatarImage, AvatarFallback }
