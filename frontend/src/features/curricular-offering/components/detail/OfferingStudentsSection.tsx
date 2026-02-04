"use client"

import { useState } from "react";
import { useOfferingStudentsList } from "../../hooks/useCurricularOfferingList";
import { OfferingStudentsTable } from "./components/OfferingStudentsTable";

type Props = {
  offeringId: number;
  offeringStatus: string;
}

export function OfferingStudentsSection({ offeringId, offeringStatus}: Props) {
  const { state, actions } = useOfferingStudentsList(offeringId);

  return (
    <div>
        <OfferingStudentsTable
         offeringStatus={offeringStatus}
          offeringId={offeringId}
          items={state.items}
          loading={state.loading}
          onSaved={() => actions.reload()}
        />
    </div>
  );
}
