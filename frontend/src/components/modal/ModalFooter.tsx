"use client";

import styles from "./Modal.module.css";

export function ModalFooter({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "right" | "space-between";
}) {
  return (
    <div className={align === "space-between" ? `${styles.footer} ${styles.footerLeft}` : styles.footer}>
      {children}
    </div>
  );
}
