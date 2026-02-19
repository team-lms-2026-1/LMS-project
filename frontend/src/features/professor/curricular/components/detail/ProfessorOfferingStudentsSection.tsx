"use client";

import { useOfferingStudentsList } from "../../hooks/useCurricularOfferingList";
import { ProfessorOfferingStudentsTable } from "./components/ProfessorOfferingStudentsTable";

type Props = {
  offeringId: number;
};

export function ProfessorOfferingStudentsSection({ offeringId }: Props) {
  const { state } = useOfferingStudentsList(offeringId);

  return (
    <div>
      <ProfessorOfferingStudentsTable items={state.items} loading={state.loading} />
    </div>
  );
}
