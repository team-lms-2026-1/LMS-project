import styles from "./StatCard.module.css";

interface StatCardProps {
    label: string;
    value: string | number;
    highlight?: boolean;
}

export function StatCard({ label, value, highlight = false }: StatCardProps) {
    return (
        <div className={styles['stat-card']}>
            <span className={styles['stat-label']}>{label}</span>
            <span className={`${styles['stat-value']} ${highlight ? styles.highlight : ""}`}>
                {value}
            </span>
        </div>
    );
}
