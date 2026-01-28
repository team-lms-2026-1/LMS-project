import * as React from "react";
import styles from "./StatusPill.module.css";

export type StatusType =
  | "PLANNED"
  | "ACTIVE"
  | "INACTIVE"
  | "DRAFT"
  | "OPEN"
  | "ENROLL_CLOSED"
  | "PROGRESS"
  | "COMPLETED"
  | "CLOSED"
  | "CANCELED";

export type StatusPillProps = {
  status: StatusType;
  /** 화면에 보여줄 텍스트(기본: status 그대로) */
  label?: string;
  /** 클릭 가능하게 쓸 때(옵션) */
  onClick?: () => void;
  /** 비활성화(옵션) */
  disabled?: boolean;
  className?: string;
  title?: string;
};

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

export function StatusPill({
  status,
  label,
  onClick,
  disabled = false,
  className,
  title,
}: StatusPillProps) {
  const text = label ?? status;

  const commonClass = cx(
    styles.pill,
    styles[`status_${status}`],
    disabled && styles.disabled,
    onClick && !disabled && styles.clickable,
    className
  );

  // 클릭이 없으면 span(표시용), 있으면 button(동작용)으로 렌더
  if (!onClick) {
    return (
      <span className={commonClass} title={title ?? text}>
        {text}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={commonClass}
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      title={title ?? text}
    >
      {text}
    </button>
  );
}
