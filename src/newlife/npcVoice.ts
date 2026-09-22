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
 *
 * ROUTING ORDER (Phase 28B "conversational act first"): a player line is
 * classified by CONVERSATIONAL ACT before it is classified by topic, and
 * only genuinely content-light chatter reaches the generic flavor pool.
 * See `docs/newlife/evaluation/PHASE_28B_CONVERSATIONAL_ACT_REPAIR_V1.md`
 * for the human-found failure this replaced: a directed statement about
 * the NPC's manner of speaking ("口調が堅苦しいよ") was falling into the
 * flavor pool and returning an unrelated line — a broken adjacency pair.
 */
import { NPC_NAMES, type NewLife30State, type NpcId } from "./types";

type Intent = "menu" | "reservation_count" | "seats" | "workshop" | "yesterday" | "profit" | "barber_check";

/**
 * `String.prototype.normalize("NFKC")` folds full-width digits/letters and
 * many punctuation variants (e.g. full-width "？" already matches our
 * regexes directly, full-width "１２" → "12") onto a single form. True
 * Kanji-numeral parsing (二十 → 20) is intentionally not implemented: no
 * fact lookup in this file compares a *player-supplied* quantity against
 * anything — every fact is a fixed constant — so there is nowhere that
 * would actually consume a parsed number.
 */
function normalizeForRouting(raw: string): string {
  const t = raw.normalize("NFKC").trim();
  return t.replace(
    /^(おはようございます|おはよう|こんにちは|こんばんは|お疲れ様です|お疲れ様|すみません|あの、?|ねえ|もしもし)[、,。.!！\s]*/u,
    "",
  );
}

/**
 * True if the input reads as a question or a request, regardless of
 * whether it maps to a known fact domain. Used both to select a fact
 * domain (topic keyword + this) and, when no domain matches, to decide
 * between a clarification (this is true) and a flavor line (this is
 * false) — see the file-level note above.
 */
function isQuestionLike(raw: string): boolean {
  const t = normalizeForRouting(raw);
  if (!t) return false;
  if (/[?？]/.test(t)) return true;
  // Sentence-final "か" (です/ます/でした/でしょう + か, in any tense/register)
  // is the standard Japanese question particle even without a "?".
  if (/か[。.!！]?\s*$/.test(t)) return true;
  if (/(かな|かしら|っけ)[。.!！]?\s*$/.test(t)) return true;
  if (/(教えて|おしえて|聞きたい|聞かせて|知りたい|ください|下さい|お願い)/.test(t)) return true;
  if (/(どんな|いくつ|いくら|どこ|だれ|誰|どっち|どちら|なぜ|どうして)/.test(t)) return true;
  if (/何(を|が|は|で|の)/.test(t)) return true;
  return false;
}

function isBarberMention(t: string): boolean {
  return /理容|床屋|理髪|barber/i.test(t);
}

function isMenuQuestion(t: string): boolean {
  if (/(何を?売|何売|何が売|売る.*何)/.test(t)) return true;
  return /(焼き菓子|お菓子|菓子|スコーン|クッキー|商品|品物|値段|価格|幾ら|いくら)/.test(t) && isQuestionLike(t);
}

function isReservationQuestion(t: string): boolean {
  if (/予約|取り置き/.test(t)) return isQuestionLike(t);
  return /店頭/.test(t) && /(何|いくつ|何点|何個|内訳|割り振り)/.test(t);
}

function isSeatsQuestion(t: string): boolean {
  return /(席|座)/.test(t) && isQuestionLike(t);
}

function isWorkshopQuestion(t: string): boolean {
  return /(工房|作業場)/.test(t) && isQuestionLike(t);
}

function isYesterdayQuestion(t: string): boolean {
  return /(昨日|前の日|前日)/.test(t) && isQuestionLike(t);
}

function isProfitQuestion(t: string): boolean {
  return /(儲か|利益|採算|黒字|赤字|経費|コスト|続けられ|続けていけ|持続)/.test(t) && isQuestionLike(t);
}

/**
 * Exported for direct testing of the paraphrase matrix (see
 * tests/newlife30Engine.test.ts) without needing to thread every case
 * through a specific NPC's voice. Order matters: product-name questions
 * ("どんな焼き菓子？") are checked before the count-split domain so a
 * question about *what's for sale* doesn't get misrouted just because it
 * also happens to mention "店頭".
 */
export function detectIntent(rawText: string): Intent | null {
  const t = normalizeForRouting(rawText);
  if (!t) return null;
  if (isBarberMention(t)) return "barber_check";
  if (isProfitQuestion(t)) return "profit";
  if (isWorkshopQuestion(t)) return "workshop";
  if (isSeatsQuestion(t)) return "seats";
  if (isMenuQuestion(t)) return "menu";
  if (isReservationQuestion(t)) return "reservation_count";
  if (isYesterdayQuestion(t)) return "yesterday";
  return null;
}

const MENU_FACT = "スコーンとクッキーです。スコーンは二十個で一個280円。クッキーは十袋で一袋240円。合わせて30点で、うち12点が予約、18点が店頭分です。";

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

/** Test-only escape hatch: is `line` one of the npc's generic (topic-free) flavor lines? */
export function isFlavorLine(npc: NpcId, line: string): boolean {
  return GENERIC_FLAVOR[npc].includes(line);
}

// ---------------------------------------------------------------------------
// Conversational-act layer (Phase 28B).
//
// A directed statement (feedback about the NPC, a compliment, criticism,
// agreement, disagreement, greeting, leave-taking, or a repair request) is
// classified *before* topic routing, and answered by acknowledging what the
// player actually said. Only a plain observation or genuinely low-information
// chatter is allowed to fall through to `flavorLine`.
// ---------------------------------------------------------------------------

export type ConversationalAct =
  | "tone_feedback"
  | "repair_request"
  | "compliment"
  | "criticism"
  | "agreement"
  | "disagreement"
  | "greeting"
  | "leave_taking";

const FOOD_TEXTURE_CONTEXT = /クッキー|スコーン|焼き菓子|お菓子|菓子|パン|生地/;

// A remark about the NPC's own manner of speaking, not about a product or
// fact. Requires either an explicit "style" noun paired with a stiffness
// adjective, an explicit request to speak more casually, or a bare stiffness
// adjective directed at the NPC with no competing food-texture context (so
// "クッキーが固い" is not misread as tone feedback).
function isToneFeedback(t: string): boolean {
  if (FOOD_TEXTURE_CONTEXT.test(t)) return false;
  const STYLE_WORD = /口調|言い方|話し方|喋り方|しゃべり方|物言い/;
  const STIFF_WITH_STYLE = /堅苦し|他人行儀|よそよそし|機械っぽ|ロボット|そっけな|冷た|固|硬|変/;
  const BARE_STIFF = /堅苦し|他人行儀|よそよそし|機械っぽ|ロボット|そっけな|冷たい|固い|硬い/;
  const CASUAL_REQUEST = /もっと.*(普通|自然|気楽|フランク).*(話|喋)|タメ口/;
  if (CASUAL_REQUEST.test(t)) return true;
  if (STYLE_WORD.test(t) && STIFF_WITH_STYLE.test(t)) return true;
  if (BARE_STIFF.test(t)) return true;
  return false;
}

function isRepairRequest(t: string): boolean {
  return /もう一(度|回).*(言|話)|^え[?？]?$|よく聞こえなかった|聞き取れなかった|どういう意味|何て言った|もう一回(お願い|言って)/.test(t);
}

function isCompliment(t: string): boolean {
  return /美味し|上手|すごい|素敵|助かる|ありがとう|良かった|いいね|好き/.test(t);
}

function isCriticism(t: string): boolean {
  return /まずい|ひどい|遅い|下手|がっかり|残念|よくない|不満/.test(t);
}

function isAgreement(t: string): boolean {
  return /そうですね|そうだね|なるほど|わかりました|わかった|了解|賛成|いいと思う/.test(t);
}

function isDisagreement(t: string): boolean {
  return /それは違う|嫌だ|反対|おかしいと思う|そうは思わない|納得できない/.test(t);
}

const GREETING_RE = /^(おはよう|こんにちは|こんばんは|やあ|どうも|はじめまして)/;
function isGreeting(t: string): boolean {
  return GREETING_RE.test(t);
}

const LEAVE_TAKING_RE = /さようなら|またね|じゃあね|失礼します|お先に|バイバイ|また明日|ではまた/;
function isLeaveTaking(t: string): boolean {
  return LEAVE_TAKING_RE.test(t);
}

/**
 * Classifies the player's line as a conversational act when it is a directed
 * statement about the conversation itself (feedback, compliment, criticism,
 * agreement, disagreement, greeting, leave-taking, repair request). Returns
 * `null` for factual questions/requests (handled by `detectIntent`) and for
 * plain observations/low-information chatter (handled by `flavorLine`).
 */
export function detectAct(text: string): ConversationalAct | null {
  const t = text.trim();
  if (!t) return null;
  if (isToneFeedback(t)) return "tone_feedback";
  if (isRepairRequest(t)) return "repair_request";
  // Compliment/criticism/agreement/disagreement are statement acts: a real
  // question ("美味しいですか？") must still reach fact routing/clarification,
  // not be swallowed here.
  if (!isQuestionLike(t)) {
    if (isCompliment(t)) return "compliment";
    if (isCriticism(t)) return "criticism";
    if (isAgreement(t)) return "agreement";
    if (isDisagreement(t)) return "disagreement";
  }
  // Greeting/leave-taking only win when nothing else about the line (fact
  // topic, question) already claimed it — checked by the caller after
  // `detectIntent` comes back empty, so a compound line like "おはようござ
  // います。どんな焼き菓子売るのですか" still answers the menu fact first.
  if (isGreeting(t)) return "greeting";
  if (isLeaveTaking(t)) return "leave_taking";
  return null;
}

const TONE_FEEDBACK_LINE: Record<NpcId, string> = {
  hina: "あ……力んでました。すみません、もう少し普通に話しますね。",
  yohei: "言い方がきつかったか。悪い、砕けて言うぞ。",
  daisuke: "そうか? ちょっと硬くなってたかもな。……いつもの調子でいくよ。",
  jin: "……硬かったか。悪い。",
  miyoko: "あら、そうだった? ごめんなさいね、もう少し気楽に話すわ。",
  fumiko: "堅かったかしら。ごめんなさい、もう少し普通に話すわね。",
};

const REPAIR_REQUEST_LINE: Record<NpcId, string> = {
  hina: "すみません、うまく伝わってなかったですね。何が知りたいか、もう一度お願いできますか。",
  yohei: "……もう一回言ってくれ。",
  daisuke: "悪い、聞き逃した。もう一回頼む。",
  jin: "……もう一度。",
  miyoko: "ごめんなさい、聞き取れなかったわ。もう一度お願いできる?",
  fumiko: "聞き取れなかったわ。要点だけもう一度お願い。",
};

const COMPLIMENT_LINE: Record<NpcId, string> = {
  hina: "うれしいです、ありがとうございます!",
  yohei: "……そうか。",
  daisuke: "だろ? もっと褒めていいぞ。",
  jin: "……そうか。",
  miyoko: "うれしいこと言ってくれるわね、ありがとう。",
  fumiko: "評価はありがたいわ。引き続き、確認は続けるけどね。",
};

const CRITICISM_LINE: Record<NpcId, string> = {
  hina: "……そう言われると刺さります。どこが気になったか、教えてもらえますか。",
  yohei: "そうか。具体的にどこだ。",
  daisuke: "うっ、痛いとこ突くな……。まあ、聞くよ。",
  jin: "……悪い。直す。",
  miyoko: "そう、教えてくれてありがとう。次はもっと気をつけるわ。",
  fumiko: "指摘はありがたいわ。どこを直せばいいか、具体的に聞かせて。",
};

const AGREEMENT_LINE: Record<NpcId, string> = {
  hina: "よかった、分かってもらえて。",
  yohei: "……そうか。",
  daisuke: "だよな。話が早くて助かる。",
  jin: "……分かった。",
  miyoko: "そう言ってもらえると安心するわ。",
  fumiko: "了解。じゃあその線で進めるわね。",
};

const DISAGREEMENT_LINE: Record<NpcId, string> = {
  hina: "……そうですか。でも、私は今の考えのままでいきたいです。",
  yohei: "そうは思わんな。数字はこれだ。",
  daisuke: "うーん、そこは譲れないところもあってさ。",
  jin: "……無理だ。二人ならやる。",
  miyoko: "そう感じたのね。でも、私はこのやり方を続けるわ。",
  fumiko: "意見は分かったわ。でも、担当と期限は変えられない。",
};

const GREETING_LINE: Record<NpcId, string> = {
  hina: "こんにちは! 今日もよろしくお願いします。",
  yohei: "……よう。",
  daisuke: "おう、来たか。",
  jin: "……どうも。",
  miyoko: "いらっしゃい、ゆっくりしていってね。",
  fumiko: "こんにちは。今日はどの用件かしら。",
};

const LEAVE_TAKING_LINE: Record<NpcId, string> = {
  hina: "はい、また来てくださいね!",
  yohei: "……ああ、また。",
  daisuke: "おう、またな。",
  jin: "……また。",
  miyoko: "気をつけて、また来てね。",
  fumiko: "また連絡するわ。お疲れさま。",
};

/** Unmapped-but-clearly-a-question fallback: never a flavor line for a directed question. */
const TOPIC_CLARIFICATION_LINE: Record<NpcId, string> = {
  hina: "すみません、何について知りたいか、もう少し具体的に聞いてもいいですか。",
  yohei: "……何の話だ。もう少し具体的に言ってくれ。",
  daisuke: "ん? 何のことか、もうちょい詳しく頼む。",
  jin: "……何のことだ。",
  miyoko: "ごめんなさい、何のことか、もう少し教えてくれる?",
  fumiko: "何について確認したいのか、具体的に言ってもらえる?",
};

export function actLine(act: ConversationalAct, npc: NpcId): string {
  switch (act) {
    case "tone_feedback": return TONE_FEEDBACK_LINE[npc];
    case "repair_request": return REPAIR_REQUEST_LINE[npc];
    case "compliment": return COMPLIMENT_LINE[npc];
    case "criticism": return CRITICISM_LINE[npc];
    case "agreement": return AGREEMENT_LINE[npc];
    case "disagreement": return DISAGREEMENT_LINE[npc];
    case "greeting": return GREETING_LINE[npc];
    case "leave_taking": return LEAVE_TAKING_LINE[npc];
  }
}

export function clarificationLine(npc: NpcId): string {
  return TOPIC_CLARIFICATION_LINE[npc];
}

/**
 * Answers a free-text line addressed to one NPC. Read-only: takes state by
 * reference and never writes to it. Returns display text only.
 *
 * Order: (1) directed acts that are about the conversation itself and don't
 * compete with a fact lookup (tone feedback, repair request); (2) the fact
 * topic domains — a compound line like a greeting-prefixed question still
 * answers the fact; (3) act types that only apply once no fact topic claimed
 * the line (compliment/criticism/agreement/disagreement/greeting/leave-taking);
 * (4) a clarification line for a line that is clearly a question/request but
 * maps to no known fact domain; (5) generic flavor, reserved for genuinely
 * content-light chatter or plain observations.
 */
export function answerFreeText(npc: NpcId, text: string, state: NewLife30State): string {
  const t = text.trim();

  // Priority 1: acts about the conversation itself that never compete with a
  // fact lookup (a food-texture complaint is excluded from tone_feedback by
  // `isToneFeedback` itself, so this can't shadow a real menu question).
  if (t) {
    const preDomainAct = detectAct(t);
    if (preDomainAct === "tone_feedback" || preDomainAct === "repair_request") {
      return actLine(preDomainAct, npc);
    }
  }

  // Priority 2: fact topic domains — a compound line like a greeting-prefixed
  // question still answers the fact, not the greeting.
  const intent = detectIntent(text);
  if (intent === "barber_check" && npc === "daisuke") return BARBER_CORRECTION;
  if (intent === "menu") return menuAnswer(npc);
  if (intent === "reservation_count") return reservationAnswer(npc);
  if (intent === "seats") return seatsAnswer(npc, state);
  if (intent === "workshop") return workshopAnswer(npc, state, state.day);
  if (intent === "yesterday") return yesterdayAnswer(npc, state, state.day);
  if (intent === "profit") return profitAnswer(npc, state.day);

  // Priority 3: remaining conversational acts (compliment/criticism/agreement/
  // disagreement/greeting/leave-taking) — only reached once no fact topic
  // claimed the line.
  if (t) {
    const act = detectAct(t);
    if (act) return actLine(act, npc);
  }

  // Priority 4: a line that is clearly a question/request but maps to no
  // known fact domain gets a clarification, never a flavor nonanswer.
  if (t && isQuestionLike(t)) return clarificationLine(npc);

  // Priority 5: genuinely content-light chatter or a plain observation.
  const seed = text.length + state.day + state.log.length;
  return flavorLine(npc, seed);
}

export function npcDisplayName(npc: NpcId): string {
  return NPC_NAMES[npc];
}
