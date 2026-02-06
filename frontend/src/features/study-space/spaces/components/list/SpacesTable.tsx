"use client";

import styles from "./SpacesTable.module.css";
import type { SpaceListItemDto } from "../../api/types";

type Props = {
  items: SpaceListItemDto[];
  loading?: boolean;
  onCardClick?: (spaceId: number) => void;
};

function toPeopleText(minPeople: number, maxPeople: number) {
  if (minPeople && maxPeople) return `${minPeople}–${maxPeople} people`;
  if (maxPeople) return `1–${maxPeople} people`;
  return "";
}

export function SpacesTable({ items, loading = false, onCardClick }: Props) {
  if (loading) {
    return <div className={styles.skeleton}>로딩 중...</div>;
  }

  if (!items?.length) {
    return <div className={styles.empty}>표시할 학습공간이 없습니다.</div>;
  }

  return (
    <div className={styles.grid}>
      {items.map((s, idx) => {
        // spaceId가 타입에 없거나 백엔드가 다른 키를 쓰면 여기만 맞춰줘
        const spaceId = (s as any).spaceId ?? idx;

        const peopleText = toPeopleText(s.minPeople, s.maxPeople);

        return (
          <button
            type="button"
            key={spaceId}
            className={styles.card}
            onClick={() => onCardClick?.(spaceId)}
          >
            <div className={styles.imageWrap}>
              {/* Next/Image는 도메인 설정 이슈가 많아서 일단 img로 */}
              <img
                className={styles.image}
                src={s.mainImageUrl || "/images/placeholder.png"}
                alt={s.spaceName}
                loading="lazy"
              />
            </div>

            <div className={styles.body}>
              <div className={styles.name}>{s.spaceName}</div>
              <div className={styles.location}>{s.location}</div>

              <div className={styles.footerRow}>
                <div className={styles.people}>
                  <span className={styles.peopleIcon}>👥</span>
                  <span>{peopleText}</span>
                </div>

                <span className={`${styles.badge} ${s.isRentable ? styles.badgeOk : styles.badgeNo}`}>
                  {s.isRentable ? "대여가능" : "대여불가"}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
