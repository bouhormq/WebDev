import * as React from "react"

function Card({
  className,
  style,
  ...props
}) {
  const cardStyle = {
    backgroundColor: "var(--card)",
    color: "var(--card-foreground)",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    borderRadius: "0.75rem",
    paddingTop: "1.5rem",
    paddingBottom: "1.5rem",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    margin: "0 auto",
    width: "20rem",
    border: "1px solid var(--border)",
    ...style,
  };

  return (
    <div
      data-slot="card"
      style={cardStyle}
      className={className}
      {...props} />
  );
}

function CardHeader({
  className,
  style,
  ...props
}) {
  const headerStyle = {
    display: "grid",
    gridAutoRows: "min-content",
    gridTemplateRows: "auto auto",
    alignItems: "start",
    gap: "0.375rem",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    ...style,
  };

  return (
    <div
      data-slot="card-header"
      style={headerStyle}
      className={className}
      {...props} />
  );
}

function CardTitle({
  className,
  style,
  ...props
}) {
  const titleStyle = {
    lineHeight: "1",
    fontWeight: "600",
    ...style,
  };
  return (
    <div
      data-slot="card-title"
      style={titleStyle}
      className={className}
      {...props} />
  );
}

function CardDescription({
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
    <div
      data-slot="card-description"
      style={descriptionStyle}
      className={className}
      {...props} />
  );
}

function CardAction({
  className,
  style,
  ...props
}) {
  const actionStyle = {
    gridColumnStart: "2",
    gridRowStart: "1",
    gridRowEnd: "span 2",
    alignSelf: "start",
    justifySelf: "end",
    ...style,
  };
  return (
    <div
      data-slot="card-action"
      style={actionStyle}
      className={className}
      {...props} />
  );
}

function CardContent({
  className,
  style,
  ...props
}) {
  const contentStyle = {
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    ...style,
  };
  return (
    <div
      data-slot="card-content"
      style={contentStyle}
      className={className}
      {...props} />
  );
}

function CardFooter({
  className,
  style,
  ...props
}) {
  const footerStyle = {
    display: "flex",
    alignItems: "center",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    ...style,
  };
  return (
    <div
      data-slot="card-footer"
      style={footerStyle}
      className={className}
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
