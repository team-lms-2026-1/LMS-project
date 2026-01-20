import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import AdminSessionGuard from "./AdminSessionGuard";
import styles from "./admin-shell.module.css";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      {/* <AdminSessionGuard /> */}

      <aside className={styles.sidebar}>
        <AdminSidebar />
      </aside>

      <div className={styles.right}>
        <header className={styles.topbar}>
          <AdminTopbar />
        </header>

        <main className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}