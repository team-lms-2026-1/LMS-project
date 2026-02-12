import type { ReactNode } from "react";
import ProfessorShell from "@/components/professor/ProfessorShell";

export const dynamic = "force-dynamic";

export default function ProfessorLayout({ children }: { children: ReactNode }) {
    return <ProfessorShell>{children}</ProfessorShell>;
}
