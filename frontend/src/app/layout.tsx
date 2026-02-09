import type { ReactNode } from "react";
import { Providers } from "./providers";
import "react-datepicker/dist/react-datepicker.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
