"use client";

import { NavigateButton, type NavigateButtonProps } from "./NavigateButton";

export type EditNavButtonProps = Omit<NavigateButtonProps, "label"> & {
  label?: string;
};

export function EditNavButton({ label = "수정", ...props }: EditNavButtonProps) {
  return <NavigateButton label={label} variant="blue" {...props} />;
}
