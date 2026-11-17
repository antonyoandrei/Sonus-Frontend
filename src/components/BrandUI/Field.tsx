import React, {
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

type FieldBase = {
  error?: string;
  hint?: ReactNode;
  id: string;
  label: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  tone?: "dark" | "light";
};

type InputFieldProps = FieldBase & {
  as?: "input";
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "prefix" | "size">;

type TextareaFieldProps = FieldBase & {
  as: "textarea";
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

export type FieldProps = InputFieldProps | TextareaFieldProps;

const FieldShell = ({
  children,
  error,
  hint,
  id,
  invalid,
  isTextarea,
  label,
  prefix,
  suffix,
  tone,
}: {
  children: ReactNode;
  error?: string;
  hint?: ReactNode;
  id: string;
  invalid: boolean;
  isTextarea: boolean;
  label: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  tone: "dark" | "light";
}) => (
  <div
    className={[
      "sonus-field",
      `sonus-field--${tone}`,
      invalid ? "is-invalid" : "",
      prefix ? "has-prefix" : "",
      suffix ? "has-suffix" : "",
      isTextarea ? "is-multiline" : "",
    ]
      .filter(Boolean)
      .join(" ")}
  >
    <label className="sonus-field__label" htmlFor={id}>
      {label}
    </label>
    <div className="sonus-field__shell">
      <div className="sonus-field__control">
        {prefix && (
          <span className="sonus-field__affix" aria-hidden="true">
            {prefix}
          </span>
        )}
        {children}
        {suffix && (
          <span className="sonus-field__affix sonus-field__affix--end">
            {suffix}
          </span>
        )}
      </div>
    </div>
    {error ? (
      <p className="sonus-field__message" id={`${id}-error`}>
        {error}
      </p>
    ) : hint ? (
      <p className="sonus-field__hint" id={`${id}-hint`}>
        {hint}
      </p>
    ) : null}
  </div>
);

export const Field = (props: FieldProps) => {
  const invalid = Boolean(props.error);
  const describedBy = props.error
    ? `${props.id}-error`
    : props.hint
      ? `${props.id}-hint`
      : undefined;

  if (props.as === "textarea") {
    const {
      as: _as,
      error,
      hint,
      id,
      label,
      prefix,
      suffix,
      tone = "dark",
      ...rest
    } = props;

    return (
      <FieldShell
        error={error}
        hint={hint}
        id={id}
        invalid={invalid}
        isTextarea
        label={label}
        prefix={prefix}
        suffix={suffix}
        tone={tone}
      >
        <textarea
          {...rest}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          id={id}
        />
      </FieldShell>
    );
  }

  const {
    as: _as,
    error,
    hint,
    id,
    label,
    prefix,
    suffix,
    tone = "dark",
    ...rest
  } = props;

  return (
    <FieldShell
      error={error}
      hint={hint}
      id={id}
      invalid={invalid}
      isTextarea={false}
      label={label}
      prefix={prefix}
      suffix={suffix}
      tone={tone}
    >
      <input
        {...rest}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        id={id}
      />
    </FieldShell>
  );
};
