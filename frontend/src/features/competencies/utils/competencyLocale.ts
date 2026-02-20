import type { Locale } from "@/i18n/locale";

type CompetencyText = {
  name: string;
  description: string;
};

const COMPETENCY_TEXTS: Record<Locale, Record<string, CompetencyText>> = {
  ko: {
    C1: {
      name: "비판적 사고",
      description: "정보를 분석하고 근거를 바탕으로 판단하는 역량",
    },
    C2: {
      name: "인성/자기관리",
      description: "자기 이해와 성찰을 바탕으로 책임감 있게 행동하는 역량",
    },
    C3: {
      name: "소통",
      description: "생각을 명확하게 전달하고 상호 이해를 이끄는 역량",
    },
    C4: {
      name: "협업",
      description: "공동 목표를 위해 역할을 조정하고 함께 성과를 만드는 역량",
    },
    C5: {
      name: "창의성",
      description: "새로운 관점으로 문제를 바라보고 아이디어를 실천하는 역량",
    },
    C6: {
      name: "융합",
      description: "다양한 지식과 경험을 연결해 새로운 가치를 만드는 역량",
    },
  },
  en: {
    C1: {
      name: "Critical Thinking",
      description: "Ability to analyze information and make evidence-based judgments",
    },
    C2: {
      name: "Character & Self-Management",
      description: "Ability to act responsibly through self-awareness and reflection",
    },
    C3: {
      name: "Communication",
      description: "Ability to communicate ideas clearly and build mutual understanding",
    },
    C4: {
      name: "Collaboration",
      description: "Ability to coordinate roles and achieve goals together",
    },
    C5: {
      name: "Creativity",
      description: "Ability to view problems from new perspectives and realize ideas",
    },
    C6: {
      name: "Convergence",
      description: "Ability to connect diverse knowledge and create new value",
    },
  },
  ja: {
    C1: {
      name: "批判的思考",
      description: "情報を分析し、根拠に基づいて判断する力",
    },
    C2: {
      name: "人間性・自己管理",
      description: "自己理解と省察を通じて責任ある行動を取る力",
    },
    C3: {
      name: "コミュニケーション",
      description: "考えを明確に伝え、相互理解を促す力",
    },
    C4: {
      name: "協働",
      description: "共通目標のために役割を調整し成果を出す力",
    },
    C5: {
      name: "創造性",
      description: "新しい視点で課題を捉え、アイデアを実行する力",
    },
    C6: {
      name: "融合",
      description: "多様な知識と経験を結び付けて新しい価値を生む力",
    },
  },
};

function normalizeCode(code: string | null | undefined): string {
  return String(code ?? "").trim().toUpperCase();
}

function findCompetencyText(code: string | null | undefined, locale: Locale): CompetencyText | null {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) return null;
  return COMPETENCY_TEXTS[locale][normalizedCode] ?? null;
}

export function getLocalizedCompetencyName(
  code: string | null | undefined,
  locale: Locale,
  fallback: string
): string {
  return findCompetencyText(code, locale)?.name ?? fallback;
}

export function getLocalizedCompetencyDescription(
  code: string | null | undefined,
  locale: Locale,
  fallback: string
): string {
  return findCompetencyText(code, locale)?.description ?? fallback;
}
