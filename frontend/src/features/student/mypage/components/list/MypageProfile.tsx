"use client";

import { useState } from "react";
import { StudentMypageResponse } from "../../api/types";
import styles from "./MypageProfile.module.css";
// import Image from "next/image"; // If using next/image with configured domains

interface Props {
    data: StudentMypageResponse;
}

const ACADEMIC_STATUS_MAP: Record<string, string> = {
    ENROLLED: "재학", // Added missing keys just in case, though they are in the map
    LEAVE: "휴학",
    GRADUATED: "졸업",
    DROPPED: "제적",
};

export default function MypageProfile({ data }: Props) {
    const [imageError, setImageError] = useState(false);

    console.log("[MypageProfile] profileImageUrl:", data.profileImageUrl);

    return (
        <section className={styles.container}>
            <div className={styles.imageWrapper}>
                {/* Debug: Showing URL when error occurs */}
                {imageError && (
                    <div style={{ fontSize: "10px", color: "red", position: "absolute", top: 0 }}>
                        {data.profileImageUrl}
                    </div>
                )}

                {/* Placeholder for profile image if url is empty or handled by a component */}
                {data.profileImageUrl && !imageError ? (
                    <img
                        src={data.profileImageUrl}
                        alt="Profile"
                        className={styles.profileImage}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className={styles.placeholderImage}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={styles.placeholderIcon}
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </div>
            <div className={styles.infoWrapper}>
                <h2 className={styles.name}>
                    {data.studentName} <span className={styles.studentNo}>({data.studentNo})</span>
                </h2>
                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>대 학</span>
                        <span className={styles.value}>{data.deptName}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>학 년</span>
                        <span className={styles.value}>{data.gradeLevel}학년</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>상 태</span>
                        <span className={styles.value}>
                            {ACADEMIC_STATUS_MAP[data.academicStatus] || data.academicStatus}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
