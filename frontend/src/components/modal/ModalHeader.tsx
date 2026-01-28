"use client";

import React from "react";
import styles from "./Modal.module.css";

export function ModalHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {right}
    </div>
  );
}
