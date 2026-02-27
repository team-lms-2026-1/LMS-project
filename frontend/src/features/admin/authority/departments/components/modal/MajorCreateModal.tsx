"use client";

import { useState } from "react";
import { createMajor } from "../../api/departmentsApi";
import { CreateMajorRequest } from "../../api/types";
import { ToggleSwitch } from "@/components/toggle/ToggleSwitch";
import toast from "react-hot-toast";
import styles from "../../styles/DepartmentModal.module.css";
import { Button } from "@/components/button/Button";
import { Modal } from "@/components/modal/Modal";
import { useI18n } from "@/i18n/useI18n";

type Props = {
    deptId: number;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function MajorCreateModal({ deptId, open, onClose, onSuccess }: Props) {
    const t = useI18n("authority.departments.modals.majorCreate");
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
            toast.error(t("validation.requiredFields"));
            return;
        }

        try {
            setLoading(true);
            await createMajor(deptId, form);
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
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {t("buttons.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        form="major-create-form"
                        disabled={loading}
                    >
                        {loading ? t("buttons.creating") : t("buttons.create")}
                    </Button>
                </div>
            }
        >
            <form id="major-create-form" onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label className={styles.label}>
                        {t("fields.majorName.label")}<span className={styles.required}>*</span>
                    </label>
                    <input
                        className={styles.input}
                        value={form.majorName}
                        onChange={(e) => setForm({ ...form, majorName: e.target.value })}
                        placeholder={t("fields.majorName.placeholder")}
                        disabled={loading}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        {t("fields.majorCode.label")}<span className={styles.required}>*</span>
                    </label>
                    <input
                        className={styles.input}
                        value={form.majorCode}
                        onChange={(e) => setForm({ ...form, majorCode: e.target.value })}
                        placeholder={t("fields.majorCode.placeholder")}
                        disabled={loading}
                    />
                </div>

                <div className={styles.field}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label className={styles.label} style={{ marginBottom: 0 }}>
                            {t("fields.isActive.label")}
                        </label>
                        <ToggleSwitch
                            checked={form.isActive}
                            onChange={(chk) => setForm({ ...form, isActive: chk })}
                        />
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {form.isActive ? t("fields.isActive.active") : t("fields.isActive.inactive")}
                        </span>
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{t("fields.description.label")}</label>
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
