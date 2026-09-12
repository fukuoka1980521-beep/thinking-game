/**
 * The deterministic, network-free NPC responder. Serves two roles at once, exactly like
 * ../../research/bounded-generative-world/testAdapter.ts's precedent: (a) the CI-safe adapter
 * vitest always uses, (b) the AI-failure fallback the live adapter degrades to (directive Section
 * 30 -- the game must never stop or show a raw technical error when the live call fails).
 *
 * Knowledge-boundary discipline (directive Section 10) is enforced structurally here, not just by
 * instruction: when the player's input names another NPC, the reply bucket below is a neutral
 * non-elaboration ("そうなの?" register) rather than any invented awareness -- there is no bucket
 * capable of fabricating a fact about another NPC's day.
 */
import type { NpcAiContext, NpcReplyEnvelope } from "./types";
import type { NpcId } from "../types";

type Bucket = "OTHER_NPC_MENTIONED" | "WORK_TALK" | "ABOUT_SELF" | "ABOUT_NPC" | "UNCERTAIN" | "GREETING" | "REUNION" | "OTHER";

const OTHER_NPC_NAMES = /洋平|美代子|相馬|神谷|大輔|陽菜|文子/;
const WORK_RE = /仕事|働|職|求人|給料|稼/;
const ABOUT_SELF_RE = /前は|以前|昔|元の仕事|辞めた/;
const ABOUT_NPC_RE = /あなたは|そちらは|お店は|長いんですか|長いんです|昔から|いつから/;
const UNCERTAIN_RE = /わからな|まだ決め|迷って|うーん|考え中/;
const GREETING_RE = /こんにちは|おはよう|どうも|はじめまして/;
const MENU_QUESTION_RE = /メニュー|何がありますか|何がある|何を売って|品揃え/;
const ORDER_REQUEST_RE = /ください|ほしい|食べたい|くれ|お願いします|売って/;
// PHASE_13 Section 15 -- the exact player-behavior pattern HV-01 observed: asking about the town's
// troubles, or offering to help, or stating an intent to start something.
const PROBLEM_INQUIRY_RE = /困って|困りごと|手伝え|手伝う|力になれ|仕事を始め|事業を始め|起業/;

/**
 * Directive Section 3/4/11 -- DIRECT QUESTION FIRST + BOUNDED MENU, enforced structurally in the
 * deterministic (CI-safe) adapter too, not only via live-prompt instruction. If the player's text
 * names a specific item, answer from the REAL catalog before falling through to any other bucket
 * -- never a generic acknowledgment when a concrete question was asked.
 */
function menuReply(context: NpcAiContext): string | null {
  if (!context.availableMenu) return null;
  if (MENU_QUESTION_RE.test(context.playerInput)) {
    const list = context.availableMenu.map((i) => i.label).join("、");
    return context.npcId === "miyoko" ? `美代子は少し考えてから言った。「あるわよ。${list}、それくらいだけどね」` : `洋平は棚を指した。「${list}なら置いてるぞ」`;
  }
  const owned = context.availableMenu.find((i) => context.playerInput.includes(i.label.replace(/（.*）/, "")));
  if (owned) {
    return context.npcId === "miyoko" ? `美代子はうなずいた。「${owned.label}ね、あるわよ」` : `洋平はうなずいた。「${owned.label}だな、あるぞ」`;
  }
  // Directive Section 4 -- a concrete order for something NOT on the real catalog must be a
  // natural, specific decline (never a silent "yes" and never a generic acknowledgment), still
  // offering what actually exists here instead of just refusing.
  if (ORDER_REQUEST_RE.test(context.playerInput)) {
    const list = context.availableMenu.map((i) => i.label).join("、");
    return context.npcId === "miyoko"
      ? `美代子は少し困ったように言った。「ごめんなさいね、うちにはそれは置いてなくて。${list}くらいなら、すぐ出せるけど」`
      : `洋平は少し首をひねった。「悪いな、うちには無いな。${list}くらいならあるが」`;
  }
  return null;
}

function classify(text: string): Bucket {
  if (OTHER_NPC_NAMES.test(text)) return "OTHER_NPC_MENTIONED";
  if (WORK_RE.test(text)) return "WORK_TALK";
  if (UNCERTAIN_RE.test(text)) return "UNCERTAIN";
  if (ABOUT_SELF_RE.test(text)) return "ABOUT_SELF";
  if (ABOUT_NPC_RE.test(text)) return "ABOUT_NPC";
  if (GREETING_RE.test(text)) return "GREETING";
  return "OTHER";
}

const REPLIES: Record<NpcId, Record<Bucket, string[]>> = {
  kamiya: {
    OTHER_NPC_MENTIONED: ["神谷は少し首を傾けた。「そうなんですか」それ以上は踏み込まなかった。"],
    WORK_TALK: ["神谷はファイルを軽くめくった。「今すぐでなくていいですよ。焦る話じゃないので」"],
    ABOUT_SELF: ["神谷はメモを取る手を止めた。「そうですか」それだけ言って、ペンを置いた。"],
    ABOUT_NPC: ["神谷は少し苦笑した。「七年目です。長いんだか短いんだか、まだよく分かりません」"],
    UNCERTAIN: ["神谷はペンを置いた。「今すぐ決めなくていいですよ。まだ来たばかりですし」"],
    GREETING: ["神谷は軽く頭を下げた。「どうも」", "神谷は顔を上げた。「こんにちは」"],
    REUNION: ["神谷は少し意外そうに顔を上げた。「しばらく見ませんでしたね」"],
    OTHER: [
      "神谷は壁の時計をちらっと見た。「そうですか」少し間があって、「……腹減ってません?」",
      "神谷は少し間を置いてから、「そうですか」と言った。",
      "神谷はペン先で紙を軽く叩きながら、「ふむ」とだけ言った。",
    ],
  },
  yohei: {
    OTHER_NPC_MENTIONED: ["洋平は「ああ」とだけ言って、それ以上は聞かなかった。"],
    WORK_TALK: ["洋平は棚の陰から答えた。「まあ、地道にやるしかないさ」"],
    ABOUT_SELF: ["洋平は少し興味深そうにした。「へえ、そうなのか」"],
    ABOUT_NPC: ["洋平は手を止めずに言った。「先代の頃からだから、長いな」"],
    UNCERTAIN: ["洋平は軽く頷いた。「まあ、焦ることもないだろう」"],
    GREETING: ["洋平は片手を挙げた。「おう」", "洋平はこちらを見て、軽く頷いた。"],
    REUNION: ["洋平は少し目を丸くした。「おう、久しぶりだな」"],
    OTHER: [
      "洋平は「そうか」とだけ言って、また作業に戻った。",
      "洋平は少し考えるような顔をしてから、「まあな」と言った。",
      "洋平は箱を運びながら、「ふうん」とだけ返した。",
    ],
  },
  miyoko: {
    OTHER_NPC_MENTIONED: ["美代子はカップを拭く手を止めた。「あら、そうなの?」それ以上は聞かなかった。"],
    WORK_TALK: ["美代子はカウンター越しに笑った。「ゆっくりでいいと思うわ」"],
    ABOUT_SELF: ["美代子は興味深そうに相槌を打った。「そうだったの」"],
    ABOUT_NPC: ["美代子は少し笑った。「もう20年になるかしら」"],
    UNCERTAIN: ["美代子は優しく言った。「ゆっくりでいいのよ」"],
    GREETING: ["美代子はにっこりした。「あら、いらっしゃい」", "美代子は手を止めて、こちらを見た。「いらっしゃい」"],
    REUNION: ["美代子は顔を上げて、少し驚いたように言った。「あら、お久しぶり。元気にしてた?」"],
    OTHER: [
      "美代子はカップを拭きながら、静かに頷いた。",
      "美代子は少し首をかしげて、「そう」とだけ言った。",
      "美代子はカウンターを軽く拭きながら、「ふふ」と笑った。",
    ],
  },
  jin: {
    OTHER_NPC_MENTIONED: ["相馬は「ふうん」とだけ言った。"],
    WORK_TALK: ["相馬は工具を確かめながら言った。「食っていければ、それでいい」"],
    ABOUT_SELF: ["相馬は少し興味を示した。「へえ」"],
    ABOUT_NPC: ["相馬は肩をすくめた。「決まった時間割はないな」"],
    UNCERTAIN: ["相馬は特に気にした様子もなく言った。「別に、急かしちゃいない」"],
    GREETING: ["相馬は軽く顎を上げた。", "相馬はちらっとこちらを見て、また手元に戻った。"],
    REUNION: ["相馬はちらっとこちらを見た。「しばらくだったな」"],
    OTHER: [
      "相馬は軽く頷いただけだった。",
      "相馬は手を止めずに、「そうか」とだけ言った。",
      "相馬は工具を袋にしまいながら、短く息をついた。",
    ],
  },
  // PHASE_12_3 -- the Thinking Resident's fallback bucket set. Deliberately still just a listener
  // here (no "circuit" reasoning in the deterministic path -- that nuance is live-model-only,
  // directive Section F/G); this only has to stay in-character and never diagnostic.
  daisuke: {
    OTHER_NPC_MENTIONED: ["大輔は鋏を動かす手を止めずに、「へえ」とだけ言った。"],
    WORK_TALK: ["大輔は少し間を置いた。「まあ、焦らなくてもいいんじゃないですか」"],
    ABOUT_SELF: ["大輔は鏡越しに小さく頷いた。「そうですか」"],
    ABOUT_NPC: ["大輔は少し笑った。「ここを継いで、もう10年になりますね」"],
    UNCERTAIN: ["大輔は静かに言った。「今すぐ決めなくてもいいと思いますよ」"],
    GREETING: ["大輔は軽く会釈した。「いらっしゃい」", "大輔は鏡越しに小さく頷いた。「どうも」"],
    REUNION: ["大輔は鏡越しに少し驚いたように言った。「お久しぶりです」"],
    OTHER: [
      "大輔は鋏の音だけを残して、しばらく黙っていた。",
      "大輔は少し間を置いてから、「そうですか」と言った。",
      "大輔は櫛を通しながら、「ふむ」とだけ返した。",
    ],
  },
  // PHASE_12_4 -- Hina's fallback bucket set. Distinct register from everyone else: quicker,
  // more talkative when her own shop comes up, more clipped when she's mid-prep.
  hina: {
    OTHER_NPC_MENTIONED: ["陽菜は少し首をかしげた。「そうなんですか」"],
    WORK_TALK: ["陽菜は手を止めずに言った。「まだ準備中なので、なんとも言えないですけど」"],
    ABOUT_SELF: ["陽菜は少し照れたように言った。「そう見えます?」"],
    ABOUT_NPC: ["陽菜は棚を拭きながら言った。「まだこっちに来て日が浅いんです」"],
    UNCERTAIN: ["陽菜はうなずいた。「分かります、私もまだ迷ってることばかりで」"],
    GREETING: ["陽菜は顔を上げた。「あ、こんにちは」", "陽菜は手を止めて、「いらっしゃいませ」と言った。"],
    REUNION: ["陽菜は顔を上げて、少し嬉しそうに言った。「あ、お久しぶりです」"],
    OTHER: [
      "陽菜は棚の位置を少しずらしながら、「うーん」とだけ言った。",
      "陽菜は手を止めて、「そうですね」と言った。",
      "陽菜は少し早口で何か言いかけて、「……いえ、なんでもないです」と言った。",
    ],
  },
  // PHASE_12_4 -- Fumiko's fallback bucket set. Brisk, direct, occasionally maternal/meddling.
  fumiko: {
    OTHER_NPC_MENTIONED: ["文子は「あら、そう」とだけ言った。"],
    WORK_TALK: ["文子ははきはきと言った。「焦ることないわよ、まだ来たばかりでしょう」"],
    ABOUT_SELF: ["文子は少し目を細めた。「そうだったの」"],
    ABOUT_NPC: ["文子は少し笑った。「小学校で35年、教えてたのよ」"],
    UNCERTAIN: ["文子はきっぱりと言った。「今すぐ決めなくていいのよ」"],
    GREETING: ["文子は片手を挙げた。「あら、いらっしゃい」", "文子はこちらを見て、「あら」とだけ言った。"],
    REUNION: ["文子は少し目を細めた。「あら、しばらく見なかったわね。元気にしてた?」"],
    OTHER: [
      "文子は掲示板の紙を直しながら、「そう」とだけ言った。",
      "文子は少し間を置いてから、「ふうん」と言った。",
      "文子は腕を組んで、「そうねえ」と言った。",
    ],
  },
  // PHASE_13 -- Kiyoshi's fallback bucket set. Terse, mildly guarded; warms up only slightly even
  // in the OTHER bucket, matching his established "頼ることへの抵抗が強い" personality.
  kiyoshi: {
    OTHER_NPC_MENTIONED: ["清は「ふん」とだけ言った。"],
    WORK_TALK: ["清は少し首を振った。「わしはもう、働いとらんよ」"],
    ABOUT_SELF: ["清は少し黙ってから、「昔の話だ」と言った。"],
    ABOUT_NPC: ["清は短く言った。「工場に長くいた。それだけだ」"],
    UNCERTAIN: ["清は特に気にした様子もなく、「そうか」とだけ言った。"],
    GREETING: ["清は軽く頷いた。", "清はちらっとこちらを見て、「ああ」と言った。"],
    REUNION: ["清はちらっとこちらを見た。「しばらく見なかったな」"],
    OTHER: [
      "清は黙って頷いただけだった。",
      "清は少し間を置いてから、「そうか」とだけ言った。",
      "清は棚の方を見たまま、「ふん」と言った。",
    ],
  },
  // PHASE_15 -- Shizuko's fallback bucket set. Soft, unhurried, avoids断定 even in the generic
  // buckets (never "そうですか"-style flatness) -- distinct from Daisuke's terser register, since
  // her whole positioning (Section 4/10) is "won't tell you what to think", not "doesn't say much".
  shizuko: {
    OTHER_NPC_MENTIONED: ["静子は少し目を細めた。「あら、そうなの」"],
    WORK_TALK: ["静子は静かに言った。「焦らなくていいと思うわよ」"],
    ABOUT_SELF: ["静子は小さく頷いた。「そうだったのね」"],
    ABOUT_NPC: ["静子は少し笑った。「この館を始めて、もう4年になるかしらね」"],
    UNCERTAIN: ["静子は優しく言った。「今すぐ決めなくてもいいのよ」"],
    GREETING: ["静子はゆっくり頷いた。「いらっしゃい」", "静子はこちらを見て、「あら」と微笑んだ。"],
    REUNION: ["静子は少し驚いたように言った。「あら、お久しぶりね」"],
    OTHER: [
      "静子はお茶を一口飲んで、静かに頷いた。",
      "静子は少し間を置いてから、「そう」とだけ言った。",
      "静子はカードを軽く揃え直しながら、「ふふ」と笑った。",
    ],
  },
};

function pick(list: string[], seed: number): string {
  return list[seed % list.length];
}

// PHASE_12_6 Section 14/19 -- days-since-last-meeting threshold for a natural "久しぶり" entry
// point, instead of the plain GREETING line. Matches the ABSENCE TEST's Case C (2-3 day reunion).
const REUNION_THRESHOLD_DAYS = 3;

/**
 * Section 15 -- structural (non-live-model-dependent) fix for the exact HV-01 finding: asked about
 * town troubles / offering to help / stating a business intent, with a real known local problem on
 * hand, must engage with it specifically rather than a generic "そうですか". Deliberately checked
 * BEFORE the ordinary bucket lookup (not added as a REPLIES bucket) so a NPC with nothing known yet
 * still falls through to its normal, honest reply -- never invents a problem to have something to say.
 */
function problemInquiryReply(context: NpcAiContext): string | null {
  if (!PROBLEM_INQUIRY_RE.test(context.playerInput)) return null;
  if (context.knownLocalProblemMentions.length === 0) return null;
  const mention = pick(context.knownLocalProblemMentions, context.historicalTurnCount);
  return mention;
}

export function deterministicNpcReply(context: NpcAiContext): NpcReplyEnvelope {
  const menu = menuReply(context);
  if (menu) return { visibleUtterance: menu };
  const problemReply = problemInquiryReply(context);
  if (problemReply) return { visibleUtterance: problemReply };
  let bucket = classify(context.playerInput);
  if (bucket === "GREETING" && context.daysSinceLastMeeting !== null && context.daysSinceLastMeeting >= REUNION_THRESHOLD_DAYS) {
    bucket = "REUNION";
  }
  const list = REPLIES[context.npcId][bucket];
  // PHASE_12_4 -- was `context.memoryOfPlayer.length`, which is windowed (MEMORY_WINDOW=6 in
  // contextBuilder.ts) and so silently froze at a constant seed once a relationship passed 6
  // total turns, locking onto one reply variant forever after (found by the 30-day structural
  // simulation). `historicalTurnCount` is the unwindowed lifetime count, so it keeps varying.
  const seed = context.historicalTurnCount;
  return { visibleUtterance: pick(list, seed) };
}

export const deterministicAdapter = async (context: NpcAiContext): Promise<NpcReplyEnvelope> => deterministicNpcReply(context);
