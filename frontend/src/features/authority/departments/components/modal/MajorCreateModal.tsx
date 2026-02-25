"use client";

import { useState } from "react";
import { createMajor } from "../../api/departmentsApi";
import { CreateMajorRequest } from "../../api/types";
import { ToggleSwitch } from "@/components/toggle/ToggleSwitch";
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

export function MajorCreateModal({ deptId, open, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<CreateMajorRequest>({
        majorCode: "",
        majorName: "",
        description: "",
        isActive: true,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.majorCode || !form.majorName) {
            toast.error("필수 항목을 입력해주세요.");
            return;
        }

        try {
            setLoading(true);
            await createMajor(deptId, form);
            toast.success("전공이 추가되었습니다.");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "전공 추가 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="전공 추가"
            footer={
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        취소
                    </Button>
                    <Button
                        type="submit"
                        form="major-create-form"
                        disabled={loading}
                    >
                        {loading ? "생성 중..." : "전공 생성"}
                    </Button>
                </div>
            }
        >
            <form id="major-create-form" onSubmit={handleSubmit}>
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
                    <label className={styles.label}>
                        전공코드<span className={styles.required}>*</span>
                    </label>
                    <input
                        className={styles.input}
                        value={form.majorCode}
                        onChange={(e) => setForm({ ...form, majorCode: e.target.value })}
                        placeholder="전공 코드 입력"
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
        </Modal>
    );
}
