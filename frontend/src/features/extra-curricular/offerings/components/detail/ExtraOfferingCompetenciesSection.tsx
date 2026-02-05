// "use client";

// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";

// import { Button } from "@/components/button";
// import styles from "./OfferingCompetenciesSection.module.css";
// import { OfferingCompetencyRadarChart } from "./components/OfferingCompetencyRadarChart";


// import { useOfferingCompetencyMapping } from "../../hooks/useCurricularOfferingList";
// import { updateCurricularOfferingCompetency } from "../../api/curricularOfferingsApi";
// import type {
//   CurricularOfferingCompetencyMappingBulkUpdateRequest,
//   ExtraCurricularOfferingDetailDto,
// } from "../../api/types";

// type Props = {
//   offeringId?: number;
//   data: ExtraCurricularOfferingDetailDto;
// };

// export function ExtraOfferingCompetenciesSection({ offeringId, data }: Props) {
//   const { state, actions } = useOfferingCompetencyMapping(offeringId);
//   const { data: mappingData, loading, error } = state;

//   // (competencyId -> weight)
//   const [weights, setWeights] = useState<Record<number, number | null>>({});

//   // 편집 모드
//   const [isEditing, setIsEditing] = useState(false);

//   // 저장 상태
//   const [saving, setSaving] = useState(false);

//   // 편집 시작 전 값 백업
//   const [backupWeights, setBackupWeights] = useState<Record<number, number | null> | null>(null);


//   // ✅ 서버 데이터로 초기값 세팅
//   useEffect(() => {
//     if (!mappingData?.length) return;

//     const init: Record<number, number | null> = {};
//     for (const item of mappingData) {
//       init[item.competencyId] = item.weight ?? null;
//     }
//     setWeights(init);

//     // 처음 진입은 읽기 전용
//     setIsEditing(false);
//   }, [mappingData]);

//   // ✅ 이미 값이 있으면 "수정", 없으면 "등록"
//   const hasAnyWeight = useMemo(() => {
//     if (!mappingData?.length) return false;
//     return mappingData.some((item) => item.weight != null);
//   }, [mappingData]);

//   // ✅ 편집 중에는 전부 선택되어야 저장 가능
//   const canSave = useMemo(() => {
//     if (!offeringId) return false;
//     if (!mappingData?.length) return false;
//     if (saving) return false;
//     if (!isEditing) return false;

//     return mappingData.every((item) => weights[item.competencyId] != null);
//   }, [offeringId, mappingData, weights, saving, isEditing]);

//   const onClickScore = (competencyId: number, weight: number) => {
//     if (!isEditing) return; // ✅ 읽기 전용이면 클릭 막기
//     setWeights((prev) => ({ ...prev, [competencyId]: weight }));
//   };

//   const onClickEdit = () => {
//     setBackupWeights({ ...weights });
//     setIsEditing(true);
//   };

//   const onCancelEdit = () => {
//     if (backupWeights) {
//       setWeights(backupWeights); // ✅ 원래 값으로 복원
//     }
//     setIsEditing(false);
//   };


//   const onSave = async () => {
//     if (!offeringId) return;
//     if (!mappingData?.length) return;

//     const body: CurricularOfferingCompetencyMappingBulkUpdateRequest = {
//       mappings: mappingData.map((item) => ({
//         competencyId: item.competencyId,
//         weight: weights[item.competencyId] as number,
//       })),
//     };

//     setSaving(true);

//     try {
//       await updateCurricularOfferingCompetency(offeringId, body);
//       toast.success("역량 맵핑이 저장되었습니다.");

//       // ✅ 저장 성공하면 다시 읽기 전용
//       setIsEditing(false);
//       setBackupWeights(null);
//       // (선택) reload 안 하기로 했지만, 서버값이 보정될 가능성 있으면 나중에 actions.reload()
//       await actions.reload();
//     } catch (e: any) {
//       const status = e?.status;
//       const code = e?.body?.error?.code;

//       if (status === 409 && code === "OFFERING_COMPETENCY_WEIGHT_DUPLICATED") {
//         toast.error("이미 다른 역량이 사용 중인 점수입니다.");
//       } else {
//         toast.error(e?.body?.error?.message || "저장 실패");
//       }
//     } finally {
//       setSaving(false);
//     }
//   };
  
//   // 주역량 계산
//   const mainCompetencies = useMemo(() => {
//     if (!mappingData?.length) return [];

//     return [...mappingData]
//       .filter((x) => x.weight != null)
//       .sort((a, b) => {
//         // weight 큰 게 우선
//         const diff = (b.weight ?? -1) - (a.weight ?? -1);
//         if (diff !== 0) return diff;
//         // 동점이면 code로 안정 정렬
//         return String(a.code).localeCompare(String(b.code));
//       })
//       .slice(0, 2);
//   }, [mappingData]);


//   // 버튼 라벨/동작 결정
//   const primaryLabel = useMemo(() => {
//     if (saving) return "저장중...";
//     if (isEditing) return "저장";
//     return hasAnyWeight ? "수정" : "등록";
//   }, [saving, isEditing, hasAnyWeight]);

//   const onPrimaryClick = () => {
//     if (isEditing) {
//       void onSave();
//     } else {
//       onClickEdit();
//     }
//   };

//   return (
//     <div className={styles.wrap}>
//       {/* 상단 */}
//       <div className={styles.section}>
//         <Header title={`${data.curricularName} (${data.offeringCode} / ${data.semesterName})`} />
//         <div className={styles.body}>
//           <span>담당교수 : {data.professorName}</span>
//           <span>
//             주역량 :{" "}
//             {mainCompetencies.length
//               ? mainCompetencies.map((c) => c.name).join(", ")
//               : "-"}
//           </span>
//         </div>
//       </div>

//       {/* 본문 */}
//       <div className={styles.mainRow}>
//         {/* 왼쪽 */}
//         <div className={`${styles.section} ${styles.leftCol}`}>
//           <Header title="역량 맵핑" />
//           <div className={styles.body}>
//             {loading ? <div>불러오는 중...</div> : null}
//             {error ? <div>조회 실패</div> : null}

//             {!loading && !error && mappingData?.length ? (
//               <>
//                 <ul className={styles.description}>
//                   {mappingData.map((item) => (
//                     <li key={item.competencyId}>
//                       <strong>{item.name}</strong> : {item.description}
//                     </li>
//                   ))}
//                 </ul>

//                 <div className={styles.mappingGrid}>
//                   {mappingData.map((item) => {
//                     const selected = weights[item.competencyId];

//                     return (
//                       <div key={item.competencyId} className={styles.mappingCard}>
//                         <div className={styles.mappingTop}>
//                           <div className={styles.mappingName}>{item.name}</div>
//                         </div>

//                         <div className={styles.scoreRow}>
//                           {[1, 2, 3, 4, 5, 6].map((n) => (
//                             <button
//                               key={n}
//                               type="button"
//                               // ✅ 읽기 전용이면 스타일만 유지 + 클릭 막힘
//                               className={[
//                                 styles.scoreBtn,
//                                 selected === n ? styles.scoreBtnActive : "",
//                                 !isEditing ? styles.scoreBtnReadOnly : "",
//                               ].join(" ")}
//                               onClick={() => onClickScore(item.competencyId, n)}
//                               disabled={!isEditing}
//                             >
//                               {n}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 <div className={styles.mappingActions}>
//                   {isEditing ? (
//                     <>
//                       <Button
//                         variant="primary"
//                         onClick={onPrimaryClick}
//                         disabled={!canSave}
//                       >
//                         {primaryLabel}
//                       </Button>
//                       <Button
//                         variant="secondary"
//                         onClick={onCancelEdit}
//                         disabled={saving}
//                       >
//                         취소
//                       </Button>
//                     </>
//                   ) : (
//                     <Button
//                       variant="primary"
//                       onClick={onPrimaryClick}
//                       disabled={saving}
//                     >
//                       {primaryLabel}
//                     </Button>
//                   )}
//                 </div>

//               </>
//             ) : null}
//           </div>
//         </div>

//         {/* 오른쪽 */}
//         <div className={`${styles.section} ${styles.rightCol}`}>
//           <Header title="역량맵핑 레이더차트" />
//           <div className={styles.body}>
//             {!loading && !error && mappingData?.length ? (
//               <OfferingCompetencyRadarChart items={mappingData} />
//             ) : null}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Header({ title }: { title: string }) {
//   return (
//     <div className={styles.sectionHeader}>
//       <div className={styles.sectionTitle}>{title}</div>
//     </div>
//   );
// }
