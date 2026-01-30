"use client";

import { useRouter } from "next/navigation";
import styles from "./OfferingDetailSection.module.css";
import { Button } from "@/components/button";

import { useCurricularDetail } from "../../hooks/useCurricularOfferingList";
import { useEffect, useState } from "react";
import { DayOfWeekType, OfferingStatus } from "../../api/types";

  const dayMap: Record<DayOfWeekType, string> = {
    MONDAY: "월",
    TUESDAY: "화",
    WEDNESDAY: "수",
    THURSDAY: "목",
    FRIDAY: "금",
    SATURDAY: "토",
    SUNDAY: "일",
  };

  type Props = {
      offeringId?: number;
  }

  export function OfferingDetailSection({
      offeringId
  }: Props) {
    const { state } = useCurricularDetail(offeringId);
    const { data, loading, error } = state;

    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // ===== 기본 정보 =====
    const [offeringCode, setOfferingCode] = useState("");
    const [curricularId, setCurricularId] = useState<number>(0);
    const [curricularName, setCurricularName] = useState("");
    const [credits, setCredits] = useState<number>(0);
    const [description, setDescription] = useState("");

    // ===== 학과 / 학기 =====
    const [deptId, setDeptId] = useState<number>(0);
    const [deptName, setDeptName] = useState("");

    const [semesterId, setSemesterId] = useState<number>(0);
    const [semesterName, setSemesterName] = useState("");

    // ===== 교수 =====
    const [professorAccountId, setProfessorAccountId] = useState<number>(0);
    const [professorName, setProfessorName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // ===== 수업 정보 =====
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeekType>("MONDAY");
    const [period, setPeriod] = useState<number>(0);
    const [enrolledCount, setEnrolledCount] = useState<number>(0);
    const [capacity, setCapacity] = useState<number>(0);
    const [location, setLocation] = useState("");

    // ===== 상태 =====
    const [status, setStatus] = useState<OfferingStatus>("DRAFT");
    
    useEffect(() => {
      if (!offeringId) {
        setOfferingCode("");

        setCurricularId(0);
        setCurricularName("");
        setCredits(0);
        setDescription("");

        setDeptId(0);
        setDeptName("");

        setSemesterId(0);
        setSemesterName("");

        setProfessorAccountId(0);
        setProfessorName("");
        setEmail("");
        setPhone("");

        setDayOfWeek("MONDAY");
        setPeriod(0);
        setEnrolledCount(0);
        setCapacity(0);
        setLocation("");

        setStatus("DRAFT");

        // 저장 UI 상태도 같이 초기화(선택)
        setSaving(false);
        setSubmitError(null);
        return;
      }

      // 로딩 중이면 대기
      if (!data) return;

      setOfferingCode(data.offeringCode);

      setCurricularId(data.curricularId);
      setCurricularName(data.curricularName);
      setCredits(data.credits);
      setDescription(data.description ?? ""); // 혹시 null이면 방어

      setDeptId(data.deptId);
      setDeptName(data.deptName);

      setSemesterId(data.semesterId);
      setSemesterName(data.semesterName);

      setProfessorAccountId(data.professorAccountId);
      setProfessorName(data.professorName);
      setEmail(data.email);
      setPhone(data.phone);

      setDayOfWeek(data.dayOfWeek);
      setPeriod(data.period);
      setEnrolledCount(data.enrolledCount);
      setCapacity(data.capacity);
      setLocation(data.location);

      setStatus(data.status);
    }, [offeringId, data]);


    return (
      <div className={styles.wrap}>
        {/* 교과: 1행 (3칸) */}
        <section className={styles.section}>
          <Header title="교과" />
          <div className={styles.body}>
            <Row cols={3}>
              <Field label="교과명" value={curricularName} />
              <Field label="주관학과" value={deptName} />
              <Field label="학점" value={credits} />
            </Row>
          </div>
        </section>

        {/* 운영: 1행(3칸) + 2행(4칸) */}
        <section className={styles.section}>
          <Header title="운영" />
          <div className={styles.body}>
            <Row cols={3}>
              <Field label="운영코드" value={offeringCode} />
              <Field label="등록인원" value={enrolledCount} />
              <Field label="수용인원" value={capacity} />
            </Row>

            <Row cols={4}>
              <Field label="학기" value={semesterName} />
              <Field label="요일" value={dayMap[dayOfWeek] ?? dayOfWeek} />
              <Field label="교시" value={`${period}교시`} />
              <Field label="장소" value={location} />
            </Row>
          </div>
        </section>

        {/* 담당교수: 1행 (3칸) */}
        <section className={styles.section}>
          <Header title="담당교수" />
          <div className={styles.body}>
            <Row cols={3}>
              <Field label="담당교수명" value={professorName} />
              <Field label="전화번호" value={phone} />
              <Field label="이메일" value={email} />
            </Row>
          </div>
        </section>

        {/* 설명: 1행(전체폭) */}
        <section className={styles.section}>
          <Header title="설명" />
          <div className={styles.body}>
            <div className={styles.descRow}>
              <div className={styles.descLabel}>설명</div>
              <div className={styles.descBox}>{description}</div>
            </div>
          </div>

          <div className={styles.sectionFooter}>
            <Button
              variant="primary"
            >
              수정
            </Button>
          </div>
        </section>
      </div>
    );
  }

  function Header({ title }: { title: string }) {
    return (
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>{title}</div>
      </div>
    );
  }

  function Row({ cols, children }: { cols: 3 | 4; children: React.ReactNode }) {
    return <div className={cols === 3 ? styles.row3 : styles.row4}>{children}</div>;
  }

  /** ✅ 한 칸(field) 자체가 "라벨 옆 값" (가로 KV) */
  function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className={styles.field}>
        <div className={styles.label}>{label}</div>
        <div className={styles.valueBox}>{value}</div>
      </div>
    );
  }
