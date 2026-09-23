/**
 * PHASE 10.21 Section 5: the three required multi-day CREATE -> PERSIST -> CONSUME/TRANSFORM
 * chains, plus the generic (material-free, REST-exempt) content. Shared verbatim by BOTH content
 * conditions (Section 15's fairness requirement) -- Condition B differs ONLY in whether Catalyst
 * additionally surfaces/connects some of this SAME material (see `catalystContent.ts`), never in
 * what material exists.
 */

import type { LifeMaterial } from "./types";

export interface ActionOutcome {
  narration: string[];
  materialCreated?: LifeMaterial;
  materialConsumedId?: string; // marks an existing material RESOLVED/CONSUMED
}

const at = (day: number, action: string) => `PLAYER_ACTION:${action}:day${day}`;

// ---------------------------------------------------------------------------
// CHAIN 1 -- PRACTICAL: trash bags (PENDING_TASK -> OBJECT -> consumed)
// ---------------------------------------------------------------------------

export function chain1Day2(): ActionOutcome {
  return {
    narration: ["必要な用事を片付けに、洋平商店に寄った。", "「燃えるゴミは指定の透明袋がいるよ」と、洋平が教えてくれた。", "手元にはまだその袋がなかった。"],
    materialCreated: {
      id: "trash_bags_needed",
      type: "PENDING_TASK",
      concreteContent: "洋平に、燃えるゴミの日は指定の透明袋が必要だと言われたが、まだ持っていない",
      origin: at(2, "HANDLE_PRACTICAL_NEED"),
      dayCreated: 2,
      authority: "PLAYER_CHOSEN_FACT",
      status: "ACTIVE",
      knownBy: ["player", "yohei"],
      possibleConsumers: ["FOLLOW_UP_PENDING", "VISIT_YOHEI"],
    },
  };
}

export function chain1Day4(): ActionOutcome {
  return {
    narration: ["前から気になっていた、指定のゴミ袋のことを思い出した。", "洋平商店まで買いに行き、10枚入りの袋を手に入れた。"],
    materialConsumedId: "trash_bags_needed",
    materialCreated: {
      id: "trash_bags_owned",
      type: "OBJECT",
      concreteContent: "洋平商店で買った、指定の透明ゴミ袋（10枚入り）",
      origin: at(4, "FOLLOW_UP_PENDING"),
      dayCreated: 4,
      authority: "PLAYER_CHOSEN_FACT",
      status: "ACTIVE",
      knownBy: ["player", "yohei"],
      possibleConsumers: ["HANDLE_PRACTICAL_NEED"],
    },
  };
}

export function chain1Day6(): ActionOutcome {
  return {
    narration: ["買っておいたゴミ袋を使って、ゴミを出した。", "袋は残り9枚になった。"],
    materialConsumedId: "trash_bags_owned",
  };
}

// ---------------------------------------------------------------------------
// CHAIN 2 -- RELATIONSHIP: Miyoko / coffee beans (SHARED_EVENT -> PROMISE -> resolved)
// ---------------------------------------------------------------------------

export function chain2Day1(): ActionOutcome {
  return {
    narration: ["喫茶のどかで、初めてコーヒーを飲んだ。", "「今のはブラジル産の豆なんですよ」と、美代子が教えてくれた。"],
    materialCreated: {
      id: "cafe_first_visit_brazil_beans",
      type: "SHARED_EVENT",
      concreteContent: "初めて喫茶のどかでコーヒーを飲んだ。豆はブラジル産だと美代子に教えてもらった",
      origin: at(1, "VISIT_CAFE"),
      dayCreated: 1,
      authority: "PLAYER_CHOSEN_FACT",
      status: "ACTIVE",
      knownBy: ["player", "miyoko"],
      possibleConsumers: ["VISIT_CAFE"],
    },
  };
}

export function chain2Day4(): ActionOutcome {
  return {
    narration: ["喫茶のどかに、また立ち寄った。", "「ブラジルの豆、お口に合いました?」と、美代子が聞いた。", "「今度、豆の種類が変わったら教えますね」と、美代子が言った。"],
    materialCreated: {
      id: "miyoko_bean_promise",
      type: "PROMISE",
      concreteContent: "美代子が、次に使うコーヒー豆の種類が変わったら教えてくれると約束した",
      origin: at(4, "VISIT_CAFE"),
      dayCreated: 4,
      authority: "PLAYER_CHOSEN_FACT",
      status: "ACTIVE",
      knownBy: ["player", "miyoko"],
      possibleConsumers: ["KEEP_PROMISE", "VISIT_CAFE"],
    },
  };
}

export function chain2Day7(): ActionOutcome {
  return {
    narration: ["約束を覚えていて、喫茶のどかに顔を出した。", "「豆、グアテマラ産に変わったんですよ」と、美代子が笑って教えてくれた。", "約束通りだった。"],
    materialConsumedId: "miyoko_bean_promise",
  };
}

// ---------------------------------------------------------------------------
// CHAIN 3 -- WORLD/PLACE: community hall (PLACE_KNOWLEDGE -> WORLD_CHANGE -> witnessed)
// ---------------------------------------------------------------------------

export function chain3Day3(): ActionOutcome {
  return {
    narration: ["特に目的もなく歩いていると、公民館の裏手に出た。", "積み重ねられた椅子と、何もない広いスペースがあるのに気づいた。"],
    materialCreated: {
      id: "hall_back_space",
      type: "PLACE_KNOWLEDGE",
      concreteContent: "公民館の裏手に、積み重ねられた椅子と広いスペースがある",
      origin: at(3, "EXPLORE"),
      dayCreated: 3,
      authority: "PLAYER_CHOSEN_FACT",
      status: "ACTIVE",
      knownBy: ["player"],
      possibleConsumers: ["EXPLORE"],
    },
  };
}

export function chain3Day6(): ActionOutcome {
  return {
    narration: ["公民館の前を通ると、長机がいくつも運び込まれているところだった。", "先日見かけた裏手のスペースに、次々と並べられていった。"],
    materialCreated: {
      id: "hall_tables_moved",
      type: "WORLD_CHANGE",
      concreteContent: "公民館の裏手のスペースに、祭りの準備で長机が運び込まれ、並べられた",
      origin: "WORLD_EVENT:festival_prep_supplies_moved_to_hall:day6",
      dayCreated: 6,
      authority: "WORLD_EVENT_WITNESSED",
      status: "ACTIVE",
      knownBy: ["player"],
      possibleConsumers: ["EXPLORE"],
    },
  };
}

export function chain3Day7(): ActionOutcome {
  return {
    narration: ["公民館の裏手に、また寄ってみた。", "先週は何もなかった場所に、長机が実際に並んでいるのを確かめた。"],
    materialConsumedId: "hall_tables_moved",
  };
}

// ---------------------------------------------------------------------------
// Generic, material-free content (REST/PERSONAL_TIME -- explicitly exempt, directive Section 10/19)
// ---------------------------------------------------------------------------

export function genericRest(): ActionOutcome {
  return { narration: ["今日は無理をせず、部屋で過ごすことにした。", "特に何もしなかったが、それも悪くなかった。"] };
}

export function genericPersonalTime(): ActionOutcome {
  return { narration: ["誰に会うでもなく、自分のための時間を過ごした。", "静かな時間だった。"] };
}

export function genericYoheiFirstVisit(): ActionOutcome {
  return {
    narration: ["洋平商店に入ると、店主らしき男性がこちらを見た。「……この辺じゃ見ない顔だね」", "必要な物をいくつか見繕ってもらい、会計を済ませた。「洋平だ、よろしく」"],
    materialCreated: {
      id: "met_yohei_event",
      type: "SHARED_EVENT",
      concreteContent: "洋平商店で初めて洋平に会い、いくつか買い物をした",
      origin: at(1, "VISIT_YOHEI"),
      dayCreated: 1,
      authority: "PLAYER_CHOSEN_FACT",
      status: "ACTIVE",
      knownBy: ["player", "yohei"],
      possibleConsumers: ["VISIT_YOHEI"],
    },
  };
}
