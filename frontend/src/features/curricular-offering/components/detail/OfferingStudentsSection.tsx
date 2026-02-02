"use client"

import { useState } from "react";
import { useOfferingStudentsList } from "../../hooks/useCurricularOfferingList";
import { OfferingStudentsTable } from "./components/OfferingStudentsTable";

export function OfferingStudentsSection({ offeringId }: { offeringId: number }) {
  const { state, actions } = useOfferingStudentsList(offeringId);
  const [ editId, setEditId ] = useState<number | null>(null);
  // useOfferingDetail(offeringId)
  // 로딩 / 에러 처리
  // 읽기 전용 상세 UI
  return (
    <div>
        <OfferingStudentsTable
          items={state.items}
          loading={state.loading}
          onEditClick={(id) => setEditId(id)}
        />
    </div>
  );
}
