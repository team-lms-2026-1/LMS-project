import type { ReactNode } from "react";
import ProfessorSidebar from "./ProfessorSidebar";
import ProfessorTopbar from "./ProfessorTopbar";
import ProfessorSessionGuard from "./ProfessorSessionGuard";
import styles from "./professor-shell.module.css";

export default function ProfessorShell({ children }: { children: ReactNode }) {
    return (
        <div className={styles.shell}>
            {/* <ProfessorSessionGuard /> */}

            <aside className={styles.sidebar}>
                <ProfessorSidebar />
            </aside>

            <div className={styles.right}>
                <header className={styles.topbar}>
                    <ProfessorTopbar />
                </header>

                <main className={styles.content}>
                    <div className={styles.contentInner}>{children}</div>
                </main>
            </div>
        </div>
    );
}
