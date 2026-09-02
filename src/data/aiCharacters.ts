import type { AiCharacterProfile } from "../types/case";

export const AI_CHARACTERS: Record<string, AiCharacterProfile> = {
  DETECTIVE: {
    key: "DETECTIVE",
    name: "探偵",
    role: "事実と解釈を分離する",
    sampleLine: "それは確認された事実ですか？",
  },
  DEVIL: {
    key: "DEVIL",
    name: "悪魔",
    role: "反証を促す",
    sampleLine: "その考えが間違っているとしたら、どんな可能性がありますか？",
  },
  OBSERVER: {
    key: "OBSERVER",
    name: "他者視点",
    role: "別の立場から考えさせる",
    sampleLine: "相手側から見ると、別の説明は考えられませんか？",
  },
  STRATEGIST: {
    key: "STRATEGIST",
    name: "参謀",
    role: "現実で何を確認すればよいか考える",
    sampleLine: "何を確認すれば、2つの仮説を区別できますか？",
  },
  // FUN_FIRST_PROTOTYPE Run Section 5: deliberately no analytical role
  // label (unlike "探偵（事実と解釈を分離する）") -- this persona is a
  // casual thinking companion, not a classification role.
  PARTNER: {
    key: "PARTNER",
    name: "相棒",
    role: "一緒に考える",
    sampleLine: "その見方、面白いね。",
  },
};
