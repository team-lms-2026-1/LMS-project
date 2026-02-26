"use client";

import { useState } from "react";
import { createDepartment } from "../../api/departmentsApi";
import { CreateDepartmentRequest } from "../../api/types";
import toast from "react-hot-toast";
import styles from "../../styles/DepartmentModal.module.css";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/button/Button";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function DepartmentCreateModal({ open, onClose, onSuccess }: Props) {
    const t = useI18n("authority.departments.modals.departmentCreate");
    const [form, setForm] = useState<CreateDepartmentRequest>({
        deptCode: "",
        deptName: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [codeError, setCodeError] = useState("");

    const handleDeptCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Uppercase A-Z only, max 5 chars
        const raw = e.target.value.replace(/[^A-Z]/g, "").slice(0, 5);
        setForm({ ...form, deptCode: raw });
        if (raw.length === 0) {
            setCodeError(t("validation.requiredDeptCode"));
        } else if (raw.length < 5) {
            setCodeError(t("validation.invalidDeptCodeFormat"));
        } else {
            setCodeError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.deptCode) {
            toast.error(t("validation.requiredDeptCode"));
            return;
        }
        if (!form.deptName.trim()) {
            toast.error(t("validation.requiredDeptName"));
            return;
        }
        if (!form.description.trim()) {
            toast.error(t("validation.requiredDescription"));
            return;
        }
        if (!/^[A-Z]{5}$/.test(form.deptCode)) {
            toast.error(t("validation.invalidDeptCodeFormat"));
            return;
        }

        try {
            setLoading(true);
            await createDepartment(form);
            toast.success(t("toasts.createSuccess"));
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || t("toasts.createFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t("title")}
            footer={
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 5 }}>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {t("buttons.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        form="department-create-form"
                        disabled={loading}
                    >
                        {loading ? t("buttons.creating") : t("buttons.create")}
                    </Button>
                </div>
            }
        >
            <form id="department-create-form" onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label className={styles.label}>
                        {t("fields.deptCode.label")}<span className={styles.required}>*</span>
                        <span className="text-xs text-gray-500 ml-2 font-normal">
                            {t("fields.deptCode.resetHint")}
                        </span>
                    </label>
                    <input
                        className={styles.input}
                        value={form.deptCode}
                        onChange={handleDeptCodeChange}
                        placeholder={t("fields.deptCode.placeholder")}
                        maxLength={5}
                        disabled={loading}
                        style={{ textTransform: "uppercase" }}
                    />
                    {codeError
                        ? <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{codeError}</span>
                        : <span style={{ color: "#9ca3af", fontSize: "12px", marginTop: "4px", display: "block" }}>
                            {t("fields.deptCode.helper", { current: form.deptCode.length, max: 5 })}
                        </span>
                    }
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        {t("fields.deptName.label")}<span className={styles.required}>*</span>
                    </label>
                    <input
                        className={styles.input}
                        value={form.deptName}
                        onChange={(e) => setForm({ ...form, deptName: e.target.value })}
                        placeholder={t("fields.deptName.placeholder")}
                        disabled={loading}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{t("fields.description.label")}<span className={styles.required}>*</span></label>
                    <textarea
                        className={styles.textarea}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder={t("fields.description.placeholder")}
                        disabled={loading}
                    />
                </div>
            </form>
        </Modal>
    );
}
