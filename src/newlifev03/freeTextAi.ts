/**
 * NEW LIFE V0.3 -- the mandatory once-per-day free-text beat (directive "FREE TEXT + AI").
 *
 * This deliberately does NOT call the live Vertex adapter that ../research/bounded-generative-
 * world uses (that module's types/canon/adapters are frozen per PHASE 12.1's accepted baseline,
 * and its NpcDialoguePacket is typed to exactly 3 NPCs) -- reusing it here would mean either
 * modifying a frozen contract or silently coupling an unrelated module to it. Instead this is a
 * small, local, deterministic responder: the player's own free text is classified into a topic
 * bucket (a pure function of what THEY typed), and only that classification is ever allowed to
 * touch game state (career signals) -- never the generated reply text itself. This is the same
 * "AI = performance, STATE = deterministic" separation bgw121 already established
 * (NpcResponseEnvelope.visibleUtterance vs. classification/proposedConsequenceId), just re-
 * implemented locally rather than importing a differently-typed module.
 *
 * The directive explicitly tolerates a reply that's "多少的外れ" (a little off) -- a keyword
 * responder that always produces SOME in-character line, never throws, and never blocks
 * progression satisfies that bar without depending on a live external call.
 */
import type { V03NpcId } from "./npcData";

export type FreeTextTopic = "AI_INTEREST" | "REPAIR_INTEREST" | "SHOP_INTEREST" | "REST_INTEREST" | "UNSURE" | "OTHER";

const KEYWORDS: [FreeTextTopic, RegExp][] = [
  ["AI_INTEREST", /AI|人工知能|プログラム|システム|パソコン|コンピュータ|IT/i],
  ["REPAIR_INTEREST", /修理|直す|工具|現場|体を動か|大工|設備/],
  ["SHOP_INTEREST", /店|商売|接客|お客|売る/],
  ["REST_INTEREST", /休み|疲れ|ゆっくり|眠/],
  ["UNSURE", /わからな|まだ決め|迷って|考え中|うーん/],
];

export function classifyFreeText(text: string): FreeTextTopic {
  for (const [topic, re] of KEYWORDS) {
    if (re.test(text)) return topic;
  }
  return text.trim().length > 0 ? "OTHER" : "UNSURE";
}

const KAMIYA_REPLIES: Record<FreeTextTopic, string> = {
  AI_INTEREST: "「AIですか。うちにも、そういう相談を持ち込む商店主がたまにいますよ」",
  REPAIR_INTEREST: "「体を動かす方が向いてる人もいますね。相馬さんのところ、今ちょうど手が足りないみたいですけど」",
  SHOP_INTEREST: "「商売か。……まあ、簡単ではないですけどね」",
  REST_INTEREST: "「今日はそれでいいと思いますよ。焦る話でもないので」",
  UNSURE: "「今すぐ決めなくてもいいですよ。ここに来て、まだ数日でしょう」",
  OTHER: "神谷はメモを取りながら、「なるほど」とだけ言った。",
};

const YOHEI_REPLIES: Record<FreeTextTopic, string> = {
  AI_INTEREST: "「よくわからんが、そういうのが得意な奴もいるんだろうな」",
  REPAIR_INTEREST: "「相馬に聞いてみろ。あいつなら分かる」",
  SHOP_INTEREST: "「商売はな、儲けより先に続けることだ」",
  REST_INTEREST: "「たまにはいいさ」",
  UNSURE: "「まあ、焦ることもないだろう」",
  OTHER: "洋平は「そうか」とだけ言って、棚の整理に戻った。",
};

const MIYOKO_REPLIES: Record<FreeTextTopic, string> = {
  AI_INTEREST: "「難しい話は分からないけど、詳しい人は強いわよね」",
  REPAIR_INTEREST: "「手先が器用な人、うらやましいわ」",
  SHOP_INTEREST: "「小さい店でも、やってみると大変よ」",
  REST_INTEREST: "「無理しないでね」",
  UNSURE: "「ゆっくりでいいと思うわ」",
  OTHER: "美代子はカップを拭きながら、静かに頷いた。",
};

const JIN_REPLIES: Record<FreeTextTopic, string> = {
  AI_INTEREST: "「機械には強いのか。なら話が合うやつがいるかもな」",
  REPAIR_INTEREST: "「なら今度、現場について来るか」",
  SHOP_INTEREST: "「店番も楽じゃなさそうだな」",
  REST_INTEREST: "「ま、そういう日もあるさ」",
  UNSURE: "「別に、急かしちゃいない」",
  OTHER: "相馬は軽く頷いただけだった。",
};

const REPLIES: Record<V03NpcId, Record<FreeTextTopic, string>> = {
  kamiya: KAMIYA_REPLIES,
  yohei: YOHEI_REPLIES,
  miyoko: MIYOKO_REPLIES,
  jin: JIN_REPLIES,
};

export interface FreeTextResult {
  topic: FreeTextTopic;
  visibleUtterance: string;
}

export function npcFreeTextReply(npc: V03NpcId, playerText: string): FreeTextResult {
  const topic = classifyFreeText(playerText);
  return { topic, visibleUtterance: REPLIES[npc][topic] };
}
