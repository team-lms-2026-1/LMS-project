"use client";

import { useEffect, useState } from "react";

export default function DeptDetailPage({
  params,
}: {
  params: { deptId: string };
}) {
  const [dept, setDept] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/bff/admin/depts/${params.deptId}`)
      .then((res) => res.json())
      .then(setDept);
  }, [params.deptId]);

  if (!dept) return <div>로딩 중...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold">학과 상세</h1>
      <p>학과명: {dept.deptName}</p>
      <p>학과코드: {dept.deptCode}</p>
      <p>사용여부: {dept.isActive ? "사용" : "미사용"}</p>
    </div>
  );
}
