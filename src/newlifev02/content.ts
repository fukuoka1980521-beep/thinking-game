/**
 * NEW LIFE V0.2 -- authored script. Every LifeMaterial's `concreteContent` IS the player-facing
 * natural-language phrase (day-summary and "carried over" readouts render this directly) -- the
 * type tag itself (OBJECT/PROMISE/...) is never shown in the UI, only used internally.
 */
import type { LifeMaterial, LifeMaterialType } from "../research/life-material-7day/types";
import type { Scene, V02Day, V02LocationId, V02State } from "./types";

function mat(
  id: string,
  type: LifeMaterialType,
  concreteContent: string,
  day: V02Day,
  origin: string,
  knownBy: LifeMaterial["knownBy"],
  authority: LifeMaterial["authority"] = "PLAYER_CHOSEN_FACT"
): LifeMaterial {
  return { id, type, concreteContent, origin, dayCreated: day, authority, status: "ACTIVE", knownBy, possibleConsumers: [] };
}

export const LOCATION_ORDER: V02LocationId[] = ["YOHEI_STORE", "CAFE_NODOKA", "COMMUNITY_HALL"];

export function introScene(state: V02State): Scene {
  if (state.day === 1) {
    return {
      image: "town",
      speaker: null,
      lines: ["仮住まいの窓を開けると、商店街のほうから声が聞こえた。", "まだ何も決めていない一日が始まる。"],
      choices: [],
      continueLabel: "出かける",
    };
  }
  if (state.day === 2) {
    const lines = ["朝、棚の脚が折れて、中身が床に散らばっていた。"];
    const choices = state.flags.borrowedToolbox
      ? [
          {
            id: "fix_with_tool",
            label: "工具箱があるし、自分で直そう",
            resultText: "昨日借りた工具箱を開けた。ねじを締め直すと、棚はすぐに元へ戻った。",
            applyFlags: { usedToolOnShelf: true, shelfFixed: true, shelfBroken: true },
            materialsAdded: [mat("day2_shelf_self_fix", "WORLD_CHANGE", "借りた工具箱で棚を直した", 2, "PLAYER_ACTION:FIX_SHELF:day2", ["player"])],
          },
          {
            id: "leave_broken_have_tool",
            label: "今日は面倒だから後で",
            resultText: "床に散らばったままにして、部屋を出た。",
            applyFlags: { shelfFixed: false, shelfBroken: true },
          },
        ]
      : [
          {
            id: "seek_jin",
            label: "相馬さんに聞いてみよう",
            resultText: "とりあえず、出かけることにした。",
            applyFlags: { seekJinForShelf: true, shelfBroken: true },
          },
          {
            id: "diy_fail",
            label: "自分でなんとかしてみる",
            resultText: "なんとか押し込んでみたが、棚は少し傾いたままになった。",
            applyFlags: { shelfFixed: false, shelfBroken: true },
          },
          {
            id: "leave_broken_no_tool",
            label: "そのままにしておく",
            resultText: "今日はそのままにして、出かけた。",
            applyFlags: { shelfFixed: false, shelfBroken: true },
          },
        ];
    return { image: "town", speaker: null, lines, choices, continueLabel: choices.length ? undefined : "出かける" };
  }
  // day 3
  const lines = state.flags.shelfFixed
    ? ["直した棚は、まだちゃんと立っている。"]
    : ["傾いたままの棚から、今朝も何かが滑り落ちた。"];
  return { image: "town", speaker: null, lines, choices: [], continueLabel: "出かける" };
}

function yoheiScene(state: V02State): Scene {
  const { day, flags } = state;
  if (day === 1) {
    return {
      image: "yohei",
      speaker: "yohei",
      lines: ["「棚の奥から、こんなものが出てきてな。」", "洋平は工具箱の蓋を二度開け閉めした。", "「まあ、まだ使えるんだけどな」"],
      choices: [
        {
          id: "borrow",
          label: "借りていっていいですか",
          resultText: "洋平は少し驚いた顔をして、頷いた。「ああ、好きに使え」",
          applyFlags: { metYohei: true, borrowedToolbox: true },
          materialsAdded: [mat("day1_yohei_toolbox", "OBJECT", "洋平から借りた古い工具箱", 1, "PLAYER_ACTION:BORROW:YOHEI_STORE", ["player", "yohei"])],
        },
        {
          id: "ask_history",
          label: "これ、いつからここにあったんですか？",
          resultText: "洋平は少し考えて、「さあな。先代の頃からじゃないか」とだけ言った。",
          applyFlags: { metYohei: true },
          materialsAdded: [mat("day1_yohei_talk", "SHARED_EVENT", "洋平と交わした最初の話", 1, "PLAYER_ACTION:TALK:YOHEI_STORE", ["player", "yohei"])],
        },
        {
          id: "leave",
          label: "今日はこれで",
          resultText: "洋平は工具箱をまた棚の奥へ戻した。",
          applyFlags: { metYohei: true },
          materialsAdded: [mat("day1_yohei_visit", "SHARED_EVENT", "洋平の店に立ち寄った", 1, "PLAYER_ACTION:VISIT:YOHEI_STORE", ["player", "yohei"])],
        },
      ],
    };
  }
  if (day === 2) {
    const jinHere = true; // canon-consistent: Jin finishes the stockroom-door job at Yohei's store early this slice
    const lines: string[] = [];
    const choices: Scene["choices"] = [];
    if (flags.borrowedToolbox) {
      lines.push("「工具箱、役に立ったか」");
      choices.push({
        id: "report_used",
        label: "棚を直すのに使いました",
        resultText: flags.jinSawTool
          ? "洋平は少し口の端を上げた。「そうか」"
          : jinHere && flags.usedToolOnShelf
            ? "洋平は少し口の端を上げた。「そうか」\n奥で戸の蝶番を見ていた相馬が、ちらりとこちらを見た。「それ、洋平さんのだろ」"
            : "洋平は少し口の端を上げた。「そうか」",
        applyFlags: jinHere && flags.usedToolOnShelf ? { jinSawTool: true, metJin: true } : {},
        materialsAdded:
          jinHere && flags.usedToolOnShelf && !flags.jinSawTool
            ? [mat("day2_jin_noticed_tool", "SHARED_EVENT", "相馬が、洋平の工具箱に気づいた", 2, "WORLD_EVENT:NOTICE:YOHEI_STORE", ["player", "jin", "yohei"], "WORLD_EVENT_WITNESSED")]
            : undefined,
      });
    } else {
      lines.push("「工具箱、まだそこにあるぞ。使うなら持っていけ」");
      choices.push({
        id: "borrow_late",
        label: "今からでも借りていきます",
        resultText: "洋平は「好きにしろ」と言って、工具箱を差し出した。",
        applyFlags: { borrowedToolbox: true },
        materialsAdded: [mat("day2_yohei_toolbox_late", "OBJECT", "洋平から借りた古い工具箱", 2, "PLAYER_ACTION:BORROW:YOHEI_STORE", ["player", "yohei"])],
      });
    }
    choices.push({
      id: "ask_festival",
      label: "最近、忙しいですか",
      resultText: "「来月の祭りの出店でな。仕入れが少し多くなる」洋平はそう言って、奥の箱を指さした。",
      materialsAdded: [mat("day2_yohei_festival", "PLACE_KNOWLEDGE", "洋平が祭りの出店準備をしている", 2, "PLAYER_ACTION:ASK:YOHEI_STORE", ["player", "yohei"])],
    });
    return { image: "yohei", speaker: "yohei", lines, choices };
  }
  // day 3
  const lines = flags.borrowedToolbox
    ? ["「工具箱、まだ持ってるなら返さんでもいいぞ。うちはもう出番がない」"]
    : ["「そういえば、工具箱の話、まだ生きてるからな」"];
  return {
    image: "yohei",
    speaker: "yohei",
    lines: [...lines, "洋平は棚の在庫を数えながら、こちらを見ずに言った。", "「来週から祭りの準備が始まる。暇なら顔を出せ」"],
    choices: [
      {
        id: "will_come",
        label: "また来ます",
        resultText: "洋平は数を数える手を止めないまま、軽く頷いた。",
        materialsAdded: [mat("day3_yohei_festival_invite", "PENDING_TASK", "来週の祭り準備、洋平に誘われている", 3, "PLAYER_ACTION:TALK:YOHEI_STORE", ["player", "yohei"])],
      },
      { id: "just_nod", label: "軽く会釈だけする", resultText: "洋平も、それ以上は何も言わなかった。" },
    ],
  };
}

function miyokoScene(state: V02State): Scene {
  const { day, flags } = state;
  if (day === 1) {
    return {
      image: "miyoko",
      speaker: "miyoko",
      lines: ["美代子はカップを拭く手を止めずに言った。", "「明日の朝、商店街の花壇を少し片づけるの」"],
      choices: [
        {
          id: "promise",
          label: "9時なら手伝えます",
          resultText: "美代子は手を止めて笑った。「じゃあ、待ってるね」",
          applyFlags: { metMiyoko: true, promisedFlowerbed: true },
          materialsAdded: [mat("day1_miyoko_promise", "PROMISE", "明日9時、美代子と花壇の片づけ", 1, "PLAYER_ACTION:PROMISE:CAFE_NODOKA", ["player", "miyoko"])],
        },
        {
          id: "ask_where",
          label: "花壇はどこにあるんですか",
          resultText: "「商店街の入口、時計の下よ」と美代子は答えた。",
          applyFlags: { metMiyoko: true },
          materialsAdded: [mat("day1_miyoko_place", "PLACE_KNOWLEDGE", "商店街入口の花壇の場所", 1, "PLAYER_ACTION:ASK:CAFE_NODOKA", ["player", "miyoko"])],
        },
        {
          id: "another_cup",
          label: "コーヒー、もう一杯もらえます？",
          resultText: "美代子は少し笑って、おかわりを注いだ。",
          applyFlags: { metMiyoko: true },
          materialsAdded: [mat("day1_miyoko_coffee", "SHARED_EVENT", "喫茶のどかで過ごした時間", 1, "PLAYER_ACTION:VISIT:CAFE_NODOKA", ["player", "miyoko"])],
        },
      ],
    };
  }
  if (day === 2) {
    if (flags.promisedFlowerbed) {
      return {
        image: "miyoko",
        speaker: "miyoko",
        lines: ["店の前で、美代子はすでにしゃがんで土をならしていた。", "「昨日言ってた花壇なんだけどね」"],
        choices: [
          {
            id: "help_now",
            label: "手伝います",
            resultText: "二人で少し土を均した。美代子は「思ったより早く終わったわ」と言った。",
            applyFlags: { helpedFlowerbed: true },
            resolveMaterialIds: ["day1_miyoko_promise"],
            materialsAdded: [mat("day2_miyoko_helped", "SHARED_EVENT", "美代子と花壇を片づけた", 2, "PLAYER_ACTION:HELP:CAFE_NODOKA", ["player", "miyoko"])],
          },
          {
            id: "skip",
            label: "今日は時間がなくて",
            resultText: "美代子は「無理しないで」と笑って、一人で作業を続けた。",
          },
        ],
      };
    }
    const openingLine = flags.sawFlowerbedTrace ? "「昨日、見てたでしょ」美代子は少し笑った。" : "美代子はカップを置いて、伸びをした。";
    return {
      image: "miyoko",
      speaker: "miyoko",
      lines: [openingLine, "「花壇、今からでもよければ」"],
      choices: [
        {
          id: "help_late",
          label: "今から手伝います",
          resultText: "二人で花壇の土を整えた。美代子は「ありがとう、助かった」と言った。",
          applyFlags: { helpedFlowerbed: true, metMiyoko: true },
          materialsAdded: [mat("day2_miyoko_helped_late", "SHARED_EVENT", "美代子と花壇を片づけた", 2, "PLAYER_ACTION:HELP:CAFE_NODOKA", ["player", "miyoko"])],
        },
        {
          id: "not_today",
          label: "今日はコーヒーだけで",
          resultText: "美代子はそれ以上誘わず、コーヒーを淹れてくれた。",
          applyFlags: { metMiyoko: true },
        },
      ],
    };
  }
  // day 3
  const lines = flags.helpedFlowerbed
    ? ["花壇には、小さな花が並んでいた。", "「あなたが手伝ってくれたところ、ちゃんと咲いたのよ」"]
    : ["花壇には、小さな花が並んでいた。", "美代子はそれを指さして、少しだけこちらを見た。"];
  return {
    image: "miyoko",
    speaker: "miyoko",
    lines,
    choices: [
      { id: "smile", label: "きれいですね", resultText: "美代子は「でしょう」と笑って、カップを差し出した。" },
      { id: "quiet", label: "何も言わず、花壇を見る", resultText: "美代子も、しばらく黙って隣に立っていた。" },
    ],
  };
}

function jinScene(state: V02State): Scene {
  const { day, flags } = state;
  if (day === 1) {
    return {
      image: "jin",
      speaker: "jin",
      lines: ["相馬は掲示板を眺めたまま、独り言のように言った。", "「この掲示、古いのが混じってるな」"],
      choices: [
        {
          id: "help_board",
          label: "手伝います",
          resultText: "相馬は少し意外そうな顔をして、「そこの10枚だけでいい」と場所を示した。",
          applyFlags: { metJin: true },
          materialsAdded: [mat("day1_jin_task", "PENDING_TASK", "集会所の掲示整理", 1, "PLAYER_ACTION:OFFER:COMMUNITY_HALL", ["player", "jin"])],
        },
        {
          id: "ask_how",
          label: "どうやって見分けるんですか",
          resultText: "相馬は「日付と担当者だけ見りゃわかる」と言った。",
          applyFlags: { metJin: true },
          materialsAdded: [mat("day1_jin_talk", "SHARED_EVENT", "相馬に掲示の見方を聞いた", 1, "PLAYER_ACTION:ASK:COMMUNITY_HALL", ["player", "jin"])],
        },
        {
          id: "leave_hall",
          label: "今日はこれで",
          resultText: "相馬は軽く頷いただけだった。",
          applyFlags: { metJin: true },
          materialsAdded: [mat("day1_jin_visit", "SHARED_EVENT", "集会所で相馬を見かけた", 1, "PLAYER_ACTION:VISIT:COMMUNITY_HALL", ["player", "jin"])],
        },
      ],
    };
  }
  if (day === 2) {
    const lines = flags.metJin ? ["「昨日の掲示、ありがとな。残りは片付けといた」"] : ["相馬は道具を片付けながら、軽く顎を上げた。"];
    return {
      image: "jin",
      speaker: "jin",
      lines,
      choices: [
        {
          id: "smalltalk",
          label: "少し世間話をする",
          resultText: "相馬は洋平の店の戸のことを少し話した。「あそこも、そろそろ直る頃だ」",
          applyFlags: { metJin: true },
          materialsAdded: [mat("day2_jin_talk", "SHARED_EVENT", "相馬と立ち話をした", 2, "PLAYER_ACTION:TALK:COMMUNITY_HALL", ["player", "jin"])],
        },
        { id: "nod_only", label: "会釈だけして通り過ぎる", resultText: "相馬もそれ以上は何も言わなかった。", applyFlags: { metJin: true } },
      ],
    };
  }
  // day 3
  return {
    image: "jin",
    speaker: "jin",
    lines: ["相馬は喫茶のどかの椅子を運び出しているところだった。", "「次はこっちの仕事でな」"],
    choices: [
      {
        id: "ask_busy",
        label: "あちこち忙しいですね",
        resultText: "相馬は椅子を下ろして、「まあ、頼まれりゃどこでも行く」と笑った。",
        materialsAdded: [mat("day3_jin_talk", "SHARED_EVENT", "相馬と椅子運びの話をした", 3, "PLAYER_ACTION:TALK:CAFE_NODOKA", ["player", "jin"])],
      },
      { id: "leave_jin", label: "邪魔しないよう離れる", resultText: "相馬は作業に戻った。" },
    ],
  };
}

export function npcSceneFor(state: V02State, location: V02LocationId): Scene {
  if (location === "YOHEI_STORE") return yoheiScene(state);
  if (location === "CAFE_NODOKA") return miyokoScene(state);
  return jinScene(state);
}

export function afternoonScene(state: V02State): Scene {
  const { day, flags } = state;
  if (day === 2 && flags.seekJinForShelf && !flags.shelfFixed) {
    return {
      image: "jin",
      speaker: "jin",
      lines: ["夕方前、相馬がふらりと立ち寄った。", "「棚、見てくれって聞いたけど」"],
      choices: [
        {
          id: "let_jin_fix",
          label: "お願いします",
          resultText: "相馬は工具を出して、脚を手早く直した。「これで大丈夫だろ」",
          applyFlags: { shelfFixed: true, metJin: true },
          materialsAdded: [mat("day2_jin_fixed_shelf", "WORLD_CHANGE", "相馬が仮住まいの棚を直してくれた", 2, "PLAYER_ACTION:ACCEPT:TRIAL_HOUSE", ["player", "jin"])],
        },
        { id: "decline_fix", label: "今日は大丈夫です", resultText: "相馬は「そうか」とだけ言って、また出ていった。" },
      ],
    };
  }
  const lines =
    day === 3
      ? ["空き店舗の前に、荷台が停まっていた。植木鉢がいくつも運び込まれている。"]
      : ["空き店舗のシャッターに、小さな紙が貼られていた。", "「近日、何か始めます」"];
  return {
    image: "town",
    speaker: null,
    lines,
    choices:
      day === 1
        ? [
            {
              id: "remember_notice",
              label: "場所だけ覚えておく",
              resultText: "次に通ったとき、気づけそうな気がした。",
              applyFlags: { noticedNotice: true },
              materialsAdded: [mat("day1_notice", "WORLD_CHANGE", "商店街の空き店舗に新しい張り紙", 1, "PLAYER_ACTION:NOTICE:SHOPPING_STREET", ["player"])],
            },
            { id: "pass_by", label: "気にせず通り過ぎる", resultText: "足を止めず、そのまま歩いた。" },
          ]
        : day === 3
          ? [
              {
                id: "look_closer",
                label: "少し覗いてみる",
                resultText: "花の名前が書かれた木箱が、いくつも並んでいた。まだ店の名前はない。",
                materialsAdded: [mat("day3_notice_progress", "WORLD_CHANGE", "空き店舗に花の木箱が運び込まれている", 3, "PLAYER_ACTION:NOTICE:SHOPPING_STREET", ["player"])],
              },
              { id: "pass_by_3", label: "今日はそのまま歩く", resultText: "気にはなったが、そのまま歩いた。" },
            ]
          : [{ id: "continue_2", label: "そのまま歩く", resultText: "商店街を歩いて、仮住まいへ向かった。" }],
  };
}

export function eveningScene(state: V02State): Scene {
  const { day, flags } = state;
  if (day === 3) {
    return {
      image: "town",
      speaker: null,
      lines: ["商店街の明かりが、ひとつずつ点いていった。", "町の一日が、また終わろうとしている。"],
      choices: [],
      continueLabel: "今日を終える",
    };
  }
  if (!flags.metMiyoko) {
    return {
      image: "town",
      speaker: null,
      lines: ["喫茶のどかの前を通ると、美代子が店先の花壇に土を足していた。"],
      choices: [],
      continueLabel: "今日を終える",
      autoApply: {
        applyFlags: { sawFlowerbedTrace: true },
        materialsAdded: [mat("day1_flowerbed_trace", "WORLD_CHANGE", "美代子が商店街の花壇を片づけていた", day as V02Day, "WORLD_EVENT:OBSERVE:SHOPPING_STREET", ["player"], "WORLD_EVENT_WITNESSED")],
      },
    };
  }
  if (!flags.metJin) {
    return { image: "town", speaker: null, lines: ["集会所の前で、相馬が掲示板を片付けているのが見えた。"], choices: [], continueLabel: "今日を終える" };
  }
  if (day === 1 && !flags.metYohei) {
    return { image: "town", speaker: null, lines: ["洋平商店のシャッターが半分下りていた。洋平が中で片付けをしている。"], choices: [], continueLabel: "今日を終える" };
  }
  if (day === 2) {
    return {
      image: "town",
      speaker: null,
      lines: ["商店街ですれ違うと、洋平と相馬が立ち話をしていた。", "「例の戸、直ったよ」「そうか」"],
      choices: [],
      continueLabel: "今日を終える",
    };
  }
  return { image: "town", speaker: null, lines: ["商店街の明かりが、ひとつずつ点いていった。"], choices: [], continueLabel: "今日を終える" };
}

export function daySummaryLines(materialsToday: LifeMaterial[]): string[] {
  const priority: LifeMaterialType[] = ["PROMISE", "PENDING_TASK", "OBJECT", "WORLD_CHANGE", "PLACE_KNOWLEDGE", "SHARED_EVENT"];
  const sorted = [...materialsToday].sort((a, b) => priority.indexOf(a.type) - priority.indexOf(b.type));
  return sorted.slice(0, 3).map((m) => m.concreteContent);
}
