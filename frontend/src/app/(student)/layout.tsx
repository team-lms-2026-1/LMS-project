// src/app/(student)/layout.tsx
import StudentShell from "@/components/student/StudentShell";

export const dynamic = "force-dynamic";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentShell>{children}</StudentShell>;
}
