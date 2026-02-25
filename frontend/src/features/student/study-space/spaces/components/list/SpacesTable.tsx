
"use client";

import styles from "./SpacesTable.module.css";
import type { SpaceListItemDto } from "../../api/types";
import { useI18n } from "@/i18n/useI18n";

type Props = {
  items: SpaceListItemDto[];
  loading?: boolean;
  onCardClick?: (spaceId: number) => void;
};

function toPeopleText(
  minPeople: number,
  maxPeople: number,
  t: ReturnType<typeof useI18n>
) {
  if (minPeople && maxPeople) return t("peopleRange", { min: minPeople, max: maxPeople });
  if (maxPeople) return t("peopleUpTo", { max: maxPeople });
  return "";
}

export function SpacesTable({ items, loading = false, onCardClick }: Props) {
  const t = useI18n("studySpace.student.spaces.table");

  if (loading) {
    return <div className={styles.skeleton}>{t("loading")}</div>;
  }

  if (!items?.length) {
    return <div className={styles.empty}>{t("empty")}</div>;
  }

  return (
    <div className={styles.grid}>
      {items.map((s, idx) => {
        // spaceId가 타입에 없거나 백엔드가 다른 키를 쓰면 여기만 맞춰줘
        const spaceId = (s as any).spaceId ?? idx;

        const peopleText = toPeopleText(s.minPeople, s.maxPeople, t);

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
                  {s.isRentable ? t("status.rentable") : t("status.notRentable")}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
