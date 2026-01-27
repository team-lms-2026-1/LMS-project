import * as React from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger";

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  className?: string;
  variant?: ButtonVariant;
  loading?: boolean;
  leftIcon?: React.ReactNode;
};

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", loading = false, disabled, leftIcon, children, type, className, ...rest },
    ref
  ) {
    const isDisabled = Boolean(disabled || loading);

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cx(
          styles.btn,
          styles[`variant_${variant}`],
          isDisabled && styles.disabled,
          loading && styles.loading,
          className
        )}
        disabled={isDisabled}
        aria-busy={loading ? true : undefined}
        {...rest}
      >
        {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
        {leftIcon ? <span className={styles.leftIcon}>{leftIcon}</span> : null}
        <span className={styles.label}>{children}</span>
      </button>
    );
  }
);
