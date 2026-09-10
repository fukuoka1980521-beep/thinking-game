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

type Bucket = "OTHER_NPC_MENTIONED" | "WORK_TALK" | "ABOUT_SELF" | "ABOUT_NPC" | "UNCERTAIN" | "GREETING" | "OTHER";

const OTHER_NPC_NAMES = /洋平|美代子|相馬|神谷/;
const WORK_RE = /仕事|働|職|求人|給料|稼/;
const ABOUT_SELF_RE = /前は|以前|昔|元の仕事|辞めた/;
const ABOUT_NPC_RE = /あなたは|そちらは|お店は|長いんですか|長いんです|昔から|いつから/;
const UNCERTAIN_RE = /わからな|まだ決め|迷って|うーん|考え中/;
const GREETING_RE = /こんにちは|おはよう|どうも|はじめまして/;

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
    ABOUT_SELF: ["神谷はメモを取った。「なるほど。……参考になります」"],
    ABOUT_NPC: ["神谷は少し苦笑した。「七年目です。長いんだか短いんだか、まだよく分かりません」"],
    UNCERTAIN: ["神谷はペンを置いた。「今すぐ決めなくていいですよ。まだ来たばかりですし」"],
    GREETING: ["神谷は軽く頭を下げた。「どうも」"],
    OTHER: [
      "神谷はメモを取りながら、「なるほど」とだけ言った。",
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
    GREETING: ["洋平は片手を挙げた。「おう」"],
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
    GREETING: ["美代子はにっこりした。「あら、いらっしゃい」"],
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
    GREETING: ["相馬は軽く顎を上げた。"],
    OTHER: [
      "相馬は軽く頷いただけだった。",
      "相馬は手を止めずに、「そうか」とだけ言った。",
      "相馬は工具を袋にしまいながら、短く息をついた。",
    ],
  },
};

function pick(list: string[], seed: number): string {
  return list[seed % list.length];
}

export function deterministicNpcReply(context: NpcAiContext): NpcReplyEnvelope {
  const bucket = classify(context.playerInput);
  const list = REPLIES[context.npcId][bucket];
  const seed = context.memoryOfPlayer.length; // varies reply pick across repeated turns, still deterministic
  return { visibleUtterance: pick(list, seed) };
}

export const deterministicAdapter = async (context: NpcAiContext): Promise<NpcReplyEnvelope> => deterministicNpcReply(context);
