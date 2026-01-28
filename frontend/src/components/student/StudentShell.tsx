import type { ReactNode } from "react";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import StudentSessionGuard from "./StudentSessionGuard";
import styles from "./student-shell.module.css";

export default function StudentShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      

      <aside className={styles.sidebar}>
        <StudentSidebar />
      </aside>

      <div className={styles.right}>
        <header className={styles.topbar}>
          <StudentTopbar />
        </header>

        <main className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}