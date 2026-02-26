"use client";

import { useEffect, useState } from "react";
import { updateDepartment, fetchDepartmentForUpdate } from "../../api/departmentsApi";
import { UpdateDepartmentRequest } from "../../api/types";
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

export function DepartmentUpdateModal({ deptId, open, onClose, onSuccess }: Props) {
    const t = useI18n("authority.departments.modals.departmentUpdate");
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
                    toast.error(t("toasts.loadFailed"));
                    onClose();
                })
                .finally(() => setFetching(false));
        }
    }, [open, deptId, onClose, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.deptName) {
            toast.error(t("validation.requiredDeptName"));
            return;
        }

        try {
            setLoading(true);
            await updateDepartment(deptId, form);
            toast.success(t("toasts.updateSuccess"));
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || t("toasts.updateFailed"));
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
                    {!fetching &&
                        <Button
                            type="submit"
                            form="department-update-form"
                            disabled={loading}
                        >
                            {loading ? t("buttons.saving") : t("buttons.save")}
                        </Button>
                    }
                </div>
            }
        >
            {fetching ? (
                <div className="p-8 text-center text-gray-500">{t("loading")}</div>
            ) : (
                <form id="department-update-form" onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>{t("fields.deptCode.label")}</label>
                        <input
                            className={`${styles.input} bg-gray-100 text-gray-500`}
                            value={deptCode}
                            disabled
                            readOnly
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            {t("fields.deptName.label")}<span className={styles.required}>*</span>
                        </label>
                        <input
                            className={styles.input}
                            value={form.deptName}
                            onChange={(e) => setForm({ ...form, deptName: e.target.value })}
                            disabled={loading}
                            placeholder={t("fields.deptName.placeholder")}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{t("fields.description.label")}</label>
                        <textarea
                            className={styles.textarea}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            disabled={loading}
                            placeholder={t("fields.description.placeholder")}
                        />
                    </div>
                </form>
            )}
        </Modal>
    );
}
