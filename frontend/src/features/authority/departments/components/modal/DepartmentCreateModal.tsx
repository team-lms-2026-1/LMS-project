"use client";

import { useState } from "react";
import { createDepartment } from "../../api/departmentsApi";
import { CreateDepartmentRequest } from "../../api/types";
import toast from "react-hot-toast";
import styles from "../../styles/DepartmentModal.module.css";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button/Button";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function DepartmentCreateModal({ open, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<CreateDepartmentRequest>({
        deptCode: "",
        deptName: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.deptCode || !form.deptName) {
            toast.error("필수 항목을 입력해주세요.");
            return;
        }

        try {
            setLoading(true);
            await createDepartment(form);
            toast.success("학과가 생성되었습니다.");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "학과 생성 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="학과 등록"
            footer={
                <div className="flex justify-end gap-2">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        취소
                    </Button>
                    <Button
                        type="submit"
                        form="department-create-form"
                        disabled={loading}
                    >
                        {loading ? "생성 중..." : "학과 생성"}
                    </Button>
                </div>
            }
        >
            <form id="department-create-form" onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label className={styles.label}>
                        학과코드<span className={styles.required}>*</span>
                        <span className="text-xs text-gray-500 ml-2 font-normal">(재설정 불가)</span>
                    </label>
                    <input
                        className={styles.input}
                        value={form.deptCode}
                        onChange={(e) => setForm({ ...form, deptCode: e.target.value })}
                        placeholder="학과 코드 입력"
                        disabled={loading}
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
                        placeholder="학과 이름 입력"
                        disabled={loading}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>설명</label>
                    <textarea
                        className={styles.textarea}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="학과에 대한 설명"
                        disabled={loading}
                    />
                </div>
            </form>
        </Modal>
    );
}
