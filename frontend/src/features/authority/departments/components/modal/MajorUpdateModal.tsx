"use client";

import { useEffect, useState } from "react";
import { fetchMajorForUpdate, updateMajor } from "../../api/departmentsApi";
import { UpdateMajorRequest } from "../../api/types";
import { ToggleSwitch } from "@/components/toggle/ToggleSwitch";
import toast from "react-hot-toast";
import styles from "../../styles/DepartmentModal.module.css";
import { Button } from "@/components/button/Button";
import { Modal } from "@/components/modal/Modal";

type Props = {
    deptId: number;
    majorId: number | null;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function MajorUpdateModal({ deptId, majorId, open, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<UpdateMajorRequest>({
        majorName: "",
        description: "",
        isActive: true,
    });
    const [originalCode, setOriginalCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (open && deptId && majorId) {
            loadMajor();
        }
    }, [open, deptId, majorId]);

    const loadMajor = async () => {
        try {
            setFetching(true);
            const res = await fetchMajorForUpdate(deptId, majorId!);
            const data = res.data;
            setForm({
                majorName: data.majorName,
                description: data.description || "",
                isActive: data.isActive,
            });
            setOriginalCode(data.majorCode);
        } catch (e: any) {
            toast.error(e.message || "전공 정보 조회 실패");
            onClose();
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!majorId) return;
        if (!form.majorName) {
            toast.error("전공명을 입력해주세요.");
            return;
        }

        try {
            setLoading(true);
            await updateMajor(deptId, majorId, form);
            toast.success("전공 정보가 수정되었습니다.");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "전공 수정 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="전공 수정"
            footer={
                <div className="flex justify-end gap-2">
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
                            form="major-update-form"
                            disabled={loading}
                        >
                            {loading ? "저장 중..." : "저장"}
                        </Button>
                    }
                </div>
            }
        >
            {fetching ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                    정보를 불러오는 중...
                </div>
            ) : (
                <form id="major-update-form" onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>전공코드</label>
                        <input
                            className={styles.input}
                            value={originalCode}
                            disabled
                            style={{ background: '#f3f4f6', color: '#6b7280' }}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            전공이름<span className={styles.required}>*</span>
                        </label>
                        <input
                            className={styles.input}
                            value={form.majorName}
                            onChange={(e) => setForm({ ...form, majorName: e.target.value })}
                            placeholder="전공 이름 입력"
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label className={styles.label} style={{ marginBottom: 0 }}>사용 여부</label>
                            <ToggleSwitch
                                checked={form.isActive}
                                onChange={(chk) => setForm({ ...form, isActive: chk })}
                            />
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {form.isActive ? "활성" : "비활성"}
                            </span>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>설명</label>
                        <textarea
                            className={styles.textarea}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="전공에 대한 설명"
                            disabled={loading}
                        />
                    </div>
                </form>
            )}
        </Modal>
    );
}
