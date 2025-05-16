"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";

import { Label } from "@/components/ui/label";

const Form = FormProvider;

const FormFieldContext = React.createContext({});

const FormField = ({ ...props }) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const FormItemContext = React.createContext({});

function FormItem({ className, style, ...props }) {
  const id = React.useId();

  const itemStyle = {
    ...style,
  };

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        style={itemStyle}
        className={className}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, style, ...props }) {
  const { error, formItemId } = useFormField();

  const labelStyle = {
    fontWeight: "500",
    lineHeight: "1",
    color: error ? "var(--destructive)" : undefined,
    ...style,
  };

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      style={labelStyle}
      className={className}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, style, ...props }) {
  const { formDescriptionId } = useFormField();

  const descriptionStyle = {
    fontSize: "0.8rem",
    color: "var(--muted-foreground)",
    ...style,
  };

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      style={descriptionStyle}
      className={className}
      {...props}
    />
  );
}

function FormMessage({ className, style, ...props }) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  const messageStyle = {
    fontSize: "0.8rem",
    fontWeight: "500",
    color: "var(--destructive)",
    ...style,
  };

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      style={messageStyle}
      className={className}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
