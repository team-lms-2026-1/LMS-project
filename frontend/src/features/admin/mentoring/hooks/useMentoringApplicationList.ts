import { useState, useEffect, useCallback } from "react";
import { fetchAdminApplications } from "../api/mentoringApi";
import { MentoringApplication } from "../api/types";

export const useMentoringApplicationList = (recruitmentId: number) => {
    const [items, setItems] = useState<MentoringApplication[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!recruitmentId) return;
        setLoading(true);
        try {
            const res = await fetchAdminApplications(recruitmentId);
            setItems(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [recruitmentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        items,
        loading,
        refresh: fetchData
    };
};
