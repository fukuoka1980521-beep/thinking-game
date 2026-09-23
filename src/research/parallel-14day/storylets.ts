/**
 * PHASE 10.20: reusable storylet templates (directive Section 14: "do not hand-author hundreds of
 * unique scenes... use reusable storylet/state-driven generation"). Both variants draw from the
 * SAME template pools -- they differ only in WHICH template gets selected for a given state
 * (variantAEngine.ts / variantBEngine.ts), never in the pool's content. This is what keeps the
 * comparison fair: Variant B gets no extra authored material, only a different selection rule.
 */

import type { ActionId, NpcId } from "./types";

export type StoryletKey =
  | "first_visit"
  | "revisit_brief"
  | "revisit_with_memory"
  | "revisit_with_memory_extended"
  | "revisit_brief_busy"
  | "generic_explore"
  | "generic_rest"
  | "generic_practical_need"
  | "generic_personal_time"
  | "generic_follow_up"
  | "generic_keep_promise"
  | "jin_suggestion"
  | "saeki_first_named"
  | "saeki_mismatch_day14";

interface StoryletTemplate {
  narration: string[];
  /** true only for templates that render a genuine, non-transactional social exchange (Material
   *  Interaction Requirement: SOCIAL_ENGAGEMENT, PHASE 10.17) -- used by both variants' Material
   *  layer identically. */
  isSocialEngagement: boolean;
}

const YOHEI_TEMPLATES: Record<string, StoryletTemplate> = {
  first_visit: {
    narration: ["洋平商店に入ると、店主らしき男性がこちらを見た。「……この辺じゃ見ない顔だね」", "必要な物をいくつか見繕ってもらい、会計を済ませた。「洋平だ、よろしく」"],
    isSocialEngagement: false,
  },
  revisit_brief: {
    narration: ["洋平商店に、また顔を出した。「よう」と、洋平が短く言った。", "必要な物だけ買って、すぐに店を出た。"],
    isSocialEngagement: false,
  },
  revisit_with_memory: {
    narration: ["洋平商店に、また顔を出した。「おう、また来たか」と、洋平が言った。", "「そういえば、前に買ってった分はどうだった」と、洋平が聞いた。", "少し話してから、必要な物を買って店を出た。"],
    isSocialEngagement: true,
  },
  revisit_with_memory_extended: {
    narration: [
      "洋平商店に、また顔を出した。「おう、また来たか」と、洋平が言った。",
      "「そういえば、前に買ってった分はどうだった」と、洋平が聞いた。",
      "少し立ち話をした。今日の店の様子や、最近のことなど、とりとめのない話だった。",
      "話が一区切りついたところで、必要な物を買って店を出た。",
    ],
    isSocialEngagement: true,
  },
  revisit_brief_busy: {
    narration: ["洋平商店に、また顔を出した。ちょうど荷物の受け取りで忙しそうだった。", "「悪いね、今ちょっと立て込んでて」と、洋平は言いながらも対応してくれた。", "必要な物だけ買って、店を出た。"],
    isSocialEngagement: false,
  },
};

const MIYOKO_TEMPLATES: Record<string, StoryletTemplate> = {
  first_visit: {
    narration: ["扉を開けると、カウンターの中にいた女性が顔を上げた。「いらっしゃいませ」", "コーヒーを頼んだ。運ばれてきた一杯を、少しずつ飲んだ。"],
    isSocialEngagement: false,
  },
  revisit_brief: {
    narration: ["喫茶のどかに、また入った。「いらっしゃいませ」と、美代子が軽く会釈した。", "コーヒーを頼み、少しだけ座ってから店を出た。"],
    isSocialEngagement: false,
  },
  revisit_with_memory: {
    narration: ["喫茶のどかに、また入った。「あ、また来てくれたんですね」と、美代子が言った。", "「この前のコーヒー、お口に合いました?」と、美代子が聞いた。", "少し話してから、席を立った。"],
    isSocialEngagement: true,
  },
  revisit_with_memory_extended: {
    narration: [
      "喫茶のどかに、また入った。「あ、また来てくれたんですね」と、美代子が言った。",
      "「この前のコーヒー、お口に合いました?」と、美代子が聞いた。",
      "その日あったことを、少しだけ話した。美代子は手を動かしながら、相槌を打ってくれた。",
      "話が落ち着いたところで、会計を済ませて店を出た。",
    ],
    isSocialEngagement: true,
  },
  revisit_brief_busy: {
    narration: ["喫茶のどかに、また入った。奥の席から、常連客の声がかかっていた。「いつもの、お願いね」", "美代子はそちらに手際よく対応してから、こちらに向き直った。「お待たせしました」", "コーヒーを受け取り、少しして店を出た。"],
    isSocialEngagement: false,
  },
};

const GENERIC_TEMPLATES: Record<string, StoryletTemplate> = {
  generic_explore: { narration: ["特に目的もなく、近所を少し歩いてみた。", "前は気づかなかった小さな発見が、いくつかあった。"], isSocialEngagement: false },
  generic_rest: { narration: ["今日は無理をせず、部屋で過ごすことにした。", "特に何もしなかったが、それも悪くなかった。"], isSocialEngagement: false },
  generic_practical_need: { narration: ["必要な用事を、ひとつ片付けた。", "特に難しいことは何もなかった。"], isSocialEngagement: false },
  generic_personal_time: { narration: ["誰に会うでもなく、自分のための時間を過ごした。", "静かな時間だった。"], isSocialEngagement: false },
  generic_follow_up: { narration: ["前から気になっていたことを、少し進めてみた。", "小さな一歩だったが、進んだことは進んだ。"], isSocialEngagement: false },
  generic_keep_promise: { narration: ["以前の約束を、覚えていたので果たすことにした。", "相手は特別なことのように扱わず、当たり前のように受け止めてくれた。"], isSocialEngagement: true },
};

const JIN_TEMPLATES: Record<string, StoryletTemplate> = {
  jin_suggestion: {
    narration: ["公民館の手伝いをしていた甚（じん）が、こちらの様子に気づいて声をかけてきた。", "「同じところで詰まってるみたいだけど、こういうやり方もあるよ」と、ひとつだけ具体的な案を出してくれた。", "うまくいくかは分からなかったが、試してみる価値はありそうだった。"],
    isSocialEngagement: true,
  },
};

const SAEKI_TEMPLATES: Record<string, StoryletTemplate> = {
  saeki_first_named: {
    narration: ["ごみ集積所で、以前も見かけたことのある人が作業をしていた。", "今日は少し言葉を交わした。「佐伯です」と、名乗ってくれた。ただそれだけの、ありふれたやり取りだった。"],
    isSocialEngagement: true,
  },
  saeki_mismatch_day14: {
    narration: ["ごみ集積所で、また佐伯と少し話した。", "「前にそう言ってましたよね」と、佐伯が何気なく口にした一言が、少しだけ引っかかった。", "そんな話をした覚えはなかった気がしたが、気のせいかもしれない。特に何も起きなかった。"],
    isSocialEngagement: false,
  },
};

const TEMPLATES_BY_NPC: Record<NpcId, Record<string, StoryletTemplate>> = {
  yohei: YOHEI_TEMPLATES,
  miyoko: MIYOKO_TEMPLATES,
  jin: JIN_TEMPLATES,
  saeki: SAEKI_TEMPLATES,
};

export function getNpcTemplate(npc: NpcId, key: string): StoryletTemplate {
  const t = TEMPLATES_BY_NPC[npc]?.[key];
  if (!t) throw new Error(`no storylet template "${key}" for npc "${npc}"`);
  return t;
}

export function getGenericTemplate(action: ActionId): StoryletTemplate {
  const key = action === "EXPLORE" ? "generic_explore" : action === "REST" ? "generic_rest" : action === "HANDLE_PRACTICAL_NEED" ? "generic_practical_need" : action === "PERSONAL_TIME" ? "generic_personal_time" : action === "FOLLOW_UP_PENDING" ? "generic_follow_up" : "generic_keep_promise";
  const t = GENERIC_TEMPLATES[key];
  if (!t) throw new Error(`no generic template for action "${action}"`);
  return t;
}
