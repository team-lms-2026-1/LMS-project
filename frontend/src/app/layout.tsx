import type { ReactNode } from "react";
import { Providers } from "./providers";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import "react-datepicker/dist/react-datepicker.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}