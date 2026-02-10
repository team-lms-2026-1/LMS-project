"use client";

import { useCallback, useState } from "react";
import { useExtraOfferingApplicantList } from "../../hooks/useExtraCurricularOfferingList";
import type { ExtraOfferingApplicantRowDto } from "../../api/types";
import { ExtraOfferingApplicantsExpandableTable } from "./components/ExtraOfferingApplicantsExpandableTable";

type Props = {
  offeringId: number;
};

export function ExtraOfferingStudentsSection({ offeringId }: Props) {
  const { state } = useExtraOfferingApplicantList(offeringId);
  const [expandedApplicationId, setExpandedApplicationId] = useState<number | null>(null);

  const handleToggle = useCallback((row: ExtraOfferingApplicantRowDto) => {
    setExpandedApplicationId((prev) => (prev === row.applicationId ? null : row.applicationId));
  }, []);

  return (
    <div>
      <ExtraOfferingApplicantsExpandableTable
        items={state.items}
        loading={state.loading}
        expandedApplicationId={expandedApplicationId}
        onToggle={handleToggle}
      />
    </div>
  );
}
