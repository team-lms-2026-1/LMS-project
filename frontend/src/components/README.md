## 공용 컴포넌트

<Button variant="primary">등록, 저장</Button>
<Button variant="secondary">수정, 취소</Button>
<Button variant="danger">삭제</Button>

# DeleteActionButton 사용법

<DeleteActionButton
  onDelete={() => semestersApi.deleteSemester(id)}
/>


# pagination 사용법

"use client";

import { Pagination, usePaginationQuery } from "@/components/ui/pagination";

export function SemestersPagination({ totalPages }: { totalPages: number }) {
  const { page, setPage } = usePaginationQuery({ history: "replace", scroll: false });

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      onChange={setPage}
    />
  );
}

# StatusPill 사용법

<StatusPill status="DRAFT" />
<StatusPill status="OPEN" />
<StatusPill status="ENROLL_CLOSED" />
<StatusPill status="PROGRESS" />
<StatusPill status="COMPLETED" />
<StatusPill status="CLOSED" />
<StatusPill status="CANCELED" />

# Toggle 사용법

const [enabled, setEnabled] = useState(false);

<ToggleSwitch
  checked={enabled}
  onChange={setEnabled}
/>

또는 

<ToggleSwitch
  checked={row.visible}
  onChange={async (v) => {
    await api.patchVisible(row.id, v);
    router.refresh();
  }}
/>


# 모달 사용법
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button";

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>열기</Button>

      <Modal
        open={open}
        title="학기 생성"
        onClose={() => setOpen(false)}
      >
        내용 들어가는 영역
      </Modal>
    </>
  );
}

# 테이블 사용법 
import { Table } from "@/components/ui/table";

type SemesterRow = {
  semesterId: number;
  name: string;
  startDate: string;
  endDate: string;
};

const columns = [
  { header: "ID", field: "semesterId", width: 80, align: "center" },
  { header: "학기명", field: "name", width: 220, align: "left" },
  { header: "시작", field: "startDate", width: 140, align: "center" },
  { header: "끝", field: "endDate", width: 140, align: "center" },
  {
    header: "액션",
    width: 140,
    align: "center",
    stopRowClick: true,
    render: (row: SemesterRow) => (
      <>
        <Button size="sm" variant="secondary">수정</Button>
        <DeleteActionButton
          size="sm"
          onDelete={() => api.deleteSemester(row.semesterId)}
        />
      </>
    ),
  },
] as const;

<Table<SemesterRow>
  columns={columns as any}
  items={items}
  rowKey={(row) => row.semesterId}
  loading={loading}
  onRowClick={(row) => router.push(`/admin/semesters/${row.semesterId}`)}
/>

