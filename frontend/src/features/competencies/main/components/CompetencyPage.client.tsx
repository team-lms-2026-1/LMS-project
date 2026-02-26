"use client";

import { useI18n } from "@/i18n/useI18n";
import styles from "./CompetencyPage.module.css";

const SIX_CS_KEYS = [
  "creativity",
  "criticalThinking",
  "collaboration",
  "communication",
  "citizenship",
  "character",
] as const;

export default function CompetencyPageClient() {
  const t = useI18n("competency.intro");

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.lead}>
            {t("lead.line1")} {t("lead.line2")}
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("sections.sixCs")}</h2>
          <ul className={styles.list}>
            {SIX_CS_KEYS.map((key) => (
              <li key={key} className={styles.listItem}>
                <div className={styles.listTitle}>{t(`cards.${key}.title`)}</div>
                <p className={styles.listDesc}>{t(`cards.${key}.description`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("sections.learningUse")}</h2>
          <p className={styles.paragraph}>{t("learning.line1")}</p>
          <p className={styles.paragraph}>{t("learning.line2")}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("sections.formula")}</h2>
          <p className={styles.paragraph}>{t("formula.line1")}</p>
          <p className={styles.paragraph}>{t("formula.line2")}</p>
          <p className={styles.paragraph}>{t("formula.line3")}</p>
          <p className={styles.paragraph}>{t("formula.line4")}</p>
          <p className={styles.paragraph}>{t("formula.line5")}</p>
        </section>
      </div>
    </div>
  );
}
