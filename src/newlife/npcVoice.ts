/**
 * NEW LIFE 30-day playable candidate — NPC expression layer ("AI OWNS
 * EXPRESSION").
 *
 * Every export here is a pure function: `(NewLife30State, ...) => string`.
 * Nothing in this file can write to `NewLife30State` — there is no
 * reducer, no setter, not even a mutable module-level variable. Free-text
 * player input is routed through `answerFreeText`, which reads state to
 * pick the right *fact* to report (system owns truth) but only ever
 * returns a string for display.
 *
 * This is a deterministic, rules-based voice layer rather than a live LLM
 * call — see the implementation-scope note in
 * docs/newlife/evaluation/PHASE_27_PLAYABLE_IMPLEMENTATION_REPORT_V1.md.
 * Per-character diction follows NEWLIFE_CHARACTER_MODELS_V3.md "SPEECH
 * MODEL" fields; the six fact intents follow
 * NEWLIFE_PHASE26_SCENARIO_VALIDATION_V1.md "直接質問の確認表".
 */
import { NPC_NAMES, type NewLife30State, type NpcId } from "./types";

type Intent = "menu" | "reservation_count" | "seats" | "workshop" | "yesterday" | "profit" | "barber_check";

function detectIntent(text: string): Intent | null {
  const t = text.trim();
  if (!t) return null;
  if (/理容|床屋|理髪|barber/i.test(t)) return "barber_check";
  if (/儲か|利益|採算|黒字|赤字/.test(t)) return "profit";
  if (/工房.*貸|貸.*工房/.test(t)) return "workshop";
  if (/席.*(使|空|座)/.test(t)) return "seats";
  if (/予約.*(何|点|個)|(何|点|個).*予約/.test(t)) return "reservation_count";
  if (/昨日.*(何|あった)/.test(t)) return "yesterday";
  if (/何を売|商品|スコーン|クッキー/.test(t)) return "menu";
  return null;
}

const MENU_FACT = "スコーン二十個、一個280円。クッキーは十袋、一袋240円。合わせて30点で、うち12点が予約、18点が店頭分です。";

function menuAnswer(npc: NpcId): string {
  switch (npc) {
    case "hina":
      return `${MENU_FACT}値段は試しに決めたもので、利益はまだ分かりません。`;
    case "yohei":
      return "十二と十八だ。合わせて三十。品物が付いてこりゃ話は別だがな。";
    default:
      return "それは陽菜に聞くのが早いわ。私が知ってるのは十二が予約、十八が店頭という数だけ。";
  }
}

function reservationAnswer(npc: NpcId): string {
  switch (npc) {
    case "yohei":
      return "店頭は十八だ。";
    case "fumiko":
      return "予約12、店頭18。掲示の日付もあわせて確認して。";
    case "hina":
      return "12点は予約で、店頭は18点です。";
    default:
      return "合わせて三十、うち予約が十二だったはず。細かい割り振りは陽菜か洋平に。";
  }
}

function seatsAnswer(npc: NpcId, state: NewLife30State): string {
  const bounded = state.mSeats === "bounded";
  if (npc === "miyoko") {
    return bounded
      ? "座る前に、ちょっと聞いて。ここはお客さんの席なの。四つまでよ。"
      : "……まだはっきり言えていなかったわね。お茶を頼む人の席なの。";
  }
  if (npc === "fumiko") {
    return bounded ? "喫茶の四席はお客さん用。会館側に待機場所を分けています。" : "そこはまだ美代子さん本人に確認していないの。";
  }
  return bounded ? "美代子さんの喫茶は四席まで。町の待合室じゃないよ。" : "そこは本人に聞かないと、まだ分からない。";
}

function workshopAnswer(npc: NpcId, state: NewLife30State, day: number): string {
  if (npc === "daisuke") {
    if (state.dWorkshop === "one_hour_yes") return "一時間なら片づけられる。それ以上は聞かないでくれよ。";
    if (state.dWorkshop === "no") return "今回は無理だ。椅子は直すけどな。";
    if (state.dWorkshop === "lapsed") return "……返事、間に合わなかったな。悪い。";
    if (day < 17) return "いったんさ……椅子なら今日直せる。工房の話はまだ。";
    return "まだ決めてない。";
  }
  if (state.dWorkshop === "pending" || state.dWorkshop === "lapsed") return "大輔本人の返事が要る。まだ聞いてない。";
  if (state.dWorkshop === "one_hour_yes") return "一時間だけ貸してくれるって。";
  return "今回は貸さないそうだ。";
}

function yesterdayAnswer(npc: NpcId, state: NewLife30State, day: number): string {
  if (day < 12) return "まだ何もない日だよ。";
  const signKnown = state.signVersion === "clear_from_start";
  const base = signKnown
    ? "初日から予約と店頭を分けて出せたから、旧い掲示を見た客はいない。"
    : "初めの掲示があいまいだったから、その版を見た客が来た。今は直してある。";
  switch (npc) {
    case "miyoko":
      return `${base}味は褒めてくれた人が多かったわ。`;
    case "yohei":
      return `${base}数はもともと合ってる。`;
    case "hina":
      return `${base}……ちゃんと渡しました。`;
    default:
      return base;
  }
}

function profitAnswer(npc: NpcId, day: number): string {
  if (day < 20) return "集計前です。まだ言えません。";
  const base = "売上は八千円。材料2,800円、包材500円、設営2,000円、場所と印刷300円で経費は5,600円。差は2,400円。";
  if (npc === "hina") return `${base}約八時間の作業を入れると一時間三百円ほど。これを利益とは呼べません。`;
  if (npc === "yohei") return `${base}数はこれだ。`;
  return `${base}まだ継続できるとは言えない額よ。`;
}

const BARBER_CORRECTION =
  "俺は椅子と家具を直す方だよ。散髪の店じゃない。誰かと勘違いしてないか？";

const GENERIC_FLAVOR: Record<NpcId, string[]> = {
  hina: ["数を指で数え直しながら、「……先に数を見ます」と言う。", "「焼き上がりの方が段取りより言うこと聞くんですけどね」と笑う。"],
  yohei: ["「で、何個だ」と棚を数えながら言う。", "短く頷いて、また自分の仕事に戻る。"],
  daisuke: ["「いったんさ……」と言いかけて、脚のガタつきを直しはじめる。", "冗談を挟んでから、話をそらす。"],
  jin: ["「先に場所」とだけ言って、荷物の重さを確かめる。", "黙って作業を続ける。"],
  miyoko: ["「座る前に、ちょっと聞いて」と前置きしてから答える。", "カップを置き、目を合わせてから話す。"],
  fumiko: ["「担当を決めましょう」と、日付入りの紙を見せる。", "「それは誰が当日直すの?」と静かに聞き返す。"],
};

function flavorLine(npc: NpcId, seed: number): string {
  const lines = GENERIC_FLAVOR[npc];
  return lines[seed % lines.length];
}

/**
 * Answers a free-text line addressed to one NPC. Read-only: takes state by
 * reference and never writes to it. Returns display text only.
 */
export function answerFreeText(npc: NpcId, text: string, state: NewLife30State): string {
  const intent = detectIntent(text);
  if (intent === "barber_check" && npc === "daisuke") return BARBER_CORRECTION;
  if (intent === "menu") return menuAnswer(npc);
  if (intent === "reservation_count") return reservationAnswer(npc);
  if (intent === "seats") return seatsAnswer(npc, state);
  if (intent === "workshop") return workshopAnswer(npc, state, state.day);
  if (intent === "yesterday") return yesterdayAnswer(npc, state, state.day);
  if (intent === "profit") return profitAnswer(npc, state.day);
  const seed = text.length + state.day + state.log.length;
  return flavorLine(npc, seed);
}

export function npcDisplayName(npc: NpcId): string {
  return NPC_NAMES[npc];
}
