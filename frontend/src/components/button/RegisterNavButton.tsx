"use client";

import { NavigateButton, type NavigateButtonProps } from "./NavigateButton";

export type RegisterNavButtonProps = Omit<NavigateButtonProps, "label"> & {
  label?: string;
};

export function RegisterNavButton({ label = "등록", ...props }: RegisterNavButtonProps) {
  return <NavigateButton label={label} variant="blue" {...props} />;
}
