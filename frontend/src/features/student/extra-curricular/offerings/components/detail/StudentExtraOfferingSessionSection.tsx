"use client";

import { useCallback, useState } from "react";
import type { ExtraSessionListItemDto } from "../../api/types";
import { useStudentExtraSessionList } from "../../hooks/useExtraCurricularOfferingList";
import { StudentExtraOfferingSessionsExpandableTable } from "./components/StudentExtraOfferingSessionsExpandableTable";

type Props = {
  offeringId: number;
};

export function StudentExtraOfferingSessionSection({ offeringId }: Props) {
  const { state, actions } = useStudentExtraSessionList(offeringId);
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

  const handleToggle = useCallback((row: ExtraSessionListItemDto) => {
    setExpandedSessionId((prev) => (prev === row.sessionId ? null : row.sessionId));
  }, []);

  return (
    <div>
      <StudentExtraOfferingSessionsExpandableTable
        offeringId={offeringId}
        items={state.items}
        loading={state.loading}
        expandedSessionId={expandedSessionId}
        onToggle={handleToggle}
        onAttended={actions.reload}
      />
    </div>
  );
}
