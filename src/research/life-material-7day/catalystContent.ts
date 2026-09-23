/**
 * PHASE 10.21: Catalyst's scripted utterances -- CONDITION B ONLY. Every utterance references an
 * ALREADY-EXISTING LifeMaterial id (never invents new macro content, directive Section 1/6/13) and
 * carries an explicit knowledge basis (directive Section 9). Appearance budget enforced by
 * `resolveAction7day.ts`, not here.
 */

import type { CatalystUtterance } from "./types";

export interface CatalystBeat {
  day: number;
  kind: "DIRECT" | "INDIRECT";
  narration: string[];
  utterances: CatalystUtterance[];
}

export const CATALYST_BEATS: CatalystBeat[] = [
  {
    day: 2,
    kind: "INDIRECT",
    narration: ["掲示板に、新しい回覧が貼られているのに気づいた。日付と「実」という名前が添えられていた。"],
    utterances: [],
  },
  {
    day: 3,
    kind: "DIRECT",
    narration: ["公民館の裏手にいると、回覧板を届けに来たらしい男性が声をかけてきた。「実です、この辺を回ってて」"],
    utterances: [
      {
        text: "「そこ、今度の祭りで机を置くらしいよ。回覧にそう書いてあった」",
        basis: "REPORTED",
        reportedBy: "回覧板の記載",
        referencesMaterialId: "hall_back_space",
      },
    ],
  },
  {
    day: 6,
    kind: "DIRECT",
    narration: ["洋平商店の前で、また実と会った。ちょうど回覧板を届けているところだった。"],
    utterances: [
      {
        text: "「洋平さん、今年は紙コップを多めに頼んだって言ってたよ」",
        basis: "REPORTED",
        reportedBy: "yohei",
        referencesMaterialId: "hall_tables_moved",
      },
    ],
  },
  {
    day: 7,
    kind: "INDIRECT",
    narration: ["喫茶のどかで、美代子がふと言った。「さっき、回覧板の実さんが来てたわよ」"],
    utterances: [],
  },
];
