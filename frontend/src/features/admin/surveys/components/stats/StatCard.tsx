import styles from "./StatCard.module.css";
import { Button } from "@/components/button";

interface StatCardProps {
    label: string;
    value: string | number;
    highlight?: boolean;
    actionLabel?: string;
    onAction?: () => void;
}

export function StatCard({ label, value, highlight = false, actionLabel, onAction }: StatCardProps) {
    return (
        <div className={styles['stat-card']}>
            <span className={styles['stat-label']}>{label}</span>
            <span className={`${styles['stat-value']} ${highlight ? styles.highlight : ""}`}>
                {value}
            </span>
            {actionLabel && onAction && (
                <div style={{ marginTop: '12px' }}>
                    <Button
                        variant="secondary"
                        onClick={onAction}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                        {actionLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}
