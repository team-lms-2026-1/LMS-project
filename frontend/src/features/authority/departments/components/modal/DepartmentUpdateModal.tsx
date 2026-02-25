"use client";

import { useEffect, useState } from "react";
import { updateDepartment, fetchDepartmentForUpdate } from "../../api/departmentsApi";
import { UpdateDepartmentRequest, ProfessorDropdownItem } from "../../api/types";
import toast from "react-hot-toast";
import styles from "../../styles/DepartmentModal.module.css";
import { Button } from "@/components/button/Button";
import { Modal } from "@/components/modal/Modal";

type Props = {
    deptId: number;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function DepartmentUpdateModal({ deptId, open, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<UpdateDepartmentRequest>({
        deptName: "",
        description: "",
        headProfessorAccountId: null,
    });
    // 학과 코드는 보여주기용 (수정 불가)
    const [deptCode, setDeptCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (open && deptId) {
            setFetching(true);
            fetchDepartmentForUpdate(deptId)
                .then((res) => {
                    const { dept } = res.data;
                    setForm({
                        deptName: dept.deptName,
                        description: dept.description || "",
                        headProfessorAccountId: dept.headProfessorAccountId,
                    });
                    setDeptCode(dept.deptCode);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("학과 정보를 불러오지 못했습니다.");
                    onClose();
                })
                .finally(() => setFetching(false));
        }
    }, [open, deptId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.deptName) {
            toast.error("학과 이름은 필수입니다.");
            return;
        }

        try {
            setLoading(true);
            await updateDepartment(deptId, form);
            toast.success("학과 정보가 수정되었습니다.");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "학과 수정 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="학과 수정"
            footer={
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        취소
                    </Button>
                    {!fetching &&
                        <Button
                            type="submit"
                            form="department-update-form"
                            disabled={loading}
                        >
                            {loading ? "저장 중..." : "저장"}
                        </Button>
                    }
                </div>
            }
        >
            {fetching ? (
                <div className="p-8 text-center text-gray-500">정보를 불러오는 중...</div>
            ) : (
                <form id="department-update-form" onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>학과코드</label>
                        <input
                            className={`${styles.input} bg-gray-100 text-gray-500`}
                            value={deptCode}
                            disabled
                            readOnly
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            학과이름<span className={styles.required}>*</span>
                        </label>
                        <input
                            className={styles.input}
                            value={form.deptName}
                            onChange={(e) => setForm({ ...form, deptName: e.target.value })}
                            disabled={loading}
                            placeholder="학과 이름 입력"
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>설명</label>
                        <textarea
                            className={styles.textarea}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            disabled={loading}
                            placeholder="학과에 대한 설명"
                        />
                    </div>
                </form>
            )}
        </Modal>
    );
}
