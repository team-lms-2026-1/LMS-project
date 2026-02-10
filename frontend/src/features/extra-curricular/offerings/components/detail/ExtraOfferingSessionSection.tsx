"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/button";

import { SessionCreateModal } from "./components/SessionCreateModal";
import { useExtraSessionList } from "../../hooks/useExtraCurricularOfferingList";
import type { ExtraSessionListItemDto ,ExtraOfferingStatus } from "../../api/types";

import { ExtraOfferingSessionsExpandableTable } from "./components/ExtraOfferingSessionsExpandableTable";

type Props = {
  offeringId: number;
  offeringStatus : ExtraOfferingStatus;
};

export default function ExtraOfferingSessionSection({ offeringId, offeringStatus }: Props) {
  const { state, actions } = useExtraSessionList(offeringId);
  const [open, setOpen] = useState(false);

  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);

  const handleToggle = useCallback((row: ExtraSessionListItemDto) => {
    setExpandedSessionId((prev) => (prev === row.sessionId ? null : row.sessionId));
  }, []);

  return (
    <div>
      <ExtraOfferingSessionsExpandableTable
        offeringId={offeringId}
        items={state.items}
        loading={state.loading}
        expandedSessionId={expandedSessionId}
        onToggle={handleToggle}
        offeringStatus={offeringStatus}
        onReloadList={actions.reload}
      />

      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={() => setOpen(true)}>회차 생성</Button>
      </div>

      <SessionCreateModal
        open={open}
        extraOfferingId={offeringId}
        onClose={() => setOpen(false)}
        onCreated={() => {
          setOpen(false);
          actions.reload();
        }}
      />
    </div>
  );
}
