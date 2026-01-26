"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "./Button";

export type NavigateButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
  href: string;
  label: string;
};

export function NavigateButton({ href, label, ...props }: NavigateButtonProps) {
  const router = useRouter();

  return (
    <Button
      {...props}
      onClick={() => router.push(href)}
    >
      {label}
    </Button>
  );
}
