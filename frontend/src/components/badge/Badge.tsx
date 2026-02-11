import * as React from "react";
import styles from "./Badge.module.css";

export interface BadgeProps {
    children: React.ReactNode;
    bgColor?: string;
    textColor?: string;
    className?: string;
    style?: React.CSSProperties;
}

function cx(...parts: Array<string | undefined | false | null>) {
    return parts.filter(Boolean).join(" ");
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    bgColor,
    textColor,
    className,
    style,
}) => {
    const mergedStyle: React.CSSProperties = {
        backgroundColor: bgColor,
        color: textColor,
        ...style,
    };

    return (
        <span className={cx(styles.badge, className)} style={mergedStyle}>
            {children}
        </span>
    );
};
