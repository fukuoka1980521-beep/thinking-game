/**
 * NEW LIFE 30-day playable candidate — day-by-day scene text.
 *
 * Condensed, English-doc-faithful adaptations of the Japanese canon in
 * docs/newlife/canonical/phase25-26/NEWLIFE_30DAY_CHARACTER_DERIVED_PLAYABLE_V3.md
 * §3–§4. Every day's facts (prices, counts, dates, who says what) match that
 * source; wording is shortened for a real playable UI rather than quoted
 * verbatim throughout. This module is presentation data only — it does not
 * decide state; see state.ts for the only place state is written.
 */
import type { Day24Outcome, DayOption, DayScene, NpcId } from "./types";

const ALL: NpcId[] = ["hina", "yohei", "daisuke", "jin", "miyoko", "fumiko"];

function scene(partial: DayScene): DayScene {
  return partial;
}

const LEAVE: DayOption = { id: "leave", label: "帰る" };

const DAYS_1_10: DayScene[] = [
  scene({
    day: 1,
    title: "値段がついた箱",
    text:
      "仮住まいの窓から通りを見下ろすと、陽菜が箱と値札を持て余している。洋平は向かいの店で棚を数えている。" +
      "陽菜が先に声をかける。「おはようございます。今度ここで少しだけ焼き菓子を売るんです。箱の置き場所、ここでいいかな」",
    npcsPresent: ["hina", "yohei"],
    options: [
      { id: "help_move_box", label: "手を貸す" },
      { id: "ask_price", label: "何をいくらで売るか聞く" },
      LEAVE,
    ],
  }),
  scene({
    day: 2,
    title: "四つの席",
    text:
      "美代子の喫茶で、仁が引きずりやすい椅子の脚に小さな当て物をつけている。美代子はお礼に水を置き、" +
      "帰り際の客へ先に「またね」と声をかける。陽菜の試売の話題が出ると、美代子は椅子を数え直す。",
    npcsPresent: ["miyoko", "jin"],
    options: [
      { id: "order_coffee", label: "コーヒーを注文する" },
      { id: "ask_about_seats", label: "席のことを聞く" },
      { id: "watch_jin", label: "仁の仕事を眺める" },
      LEAVE,
    ],
    lowEngagementHook: "美代子がふと目を上げ、「あなたも今日は静かね。座ってるだけでいいのよ」と短く言う。",
  }),
  scene({
    day: 3,
    title: "担当という言葉",
    text:
      "文子が会館に小さな掲示板を据え、「場所を貸すだけなら簡単、使った後まで考えるとね」と日付を入れる。" +
      "美代子がコーヒーを持ってくるが、文子の「人が待つなら助かる」という言い方には返事を曖昧にする。",
    npcsPresent: ["fumiko", "miyoko"],
    options: [
      { id: "ask_about_sign", label: "掲示について尋ねる" },
      { id: "ask_miyoko_intent", label: "美代子に席の意向を聞く" },
      { id: "say_nothing", label: "何も言わない" },
    ],
    lowEngagementHook: "文子がこちらへ一瞬だけ視線を向け、「見ているだけでも記録にはなるわ」と独り言のように言う。",
  }),
  scene({
    day: 4,
    title: "仮止めの椅子",
    text:
      "大輔の工房で、椅子を試しに座る客がいる。大輔は軽口を挟みながら脚を締めるが、文子が" +
      "「試売の日、受け取り場所にも使える？」と聞くと工具を見直す。「椅子一脚なら今日返せるんだけどね」。",
    npcsPresent: ["daisuke", "fumiko"],
    options: [
      { id: "ask_workshop", label: "工房の都合を聞く" },
      { id: "sit_on_chair", label: "椅子を持って確かめる" },
      { id: "leave_without_rushing", label: "返事を急かさず帰る" },
    ],
  }),
  scene({
    day: 5,
    title: "いい商品、違う質問",
    text:
      "陽菜が試作品を美代子に渡す。美代子は食べてから「味は好き。ただ、予約の人と今来た人は、どこで分けるの？」と聞く。" +
      "陽菜は焼き時間を説明しかけ、言い直す。",
    npcsPresent: ["hina", "miyoko"],
    options: [
      { id: "ask_price_as_customer", label: "客として値段を聞く" },
      { id: "ask_pickup_method", label: "引き渡し方を聞く" },
      LEAVE,
    ],
  }),
  scene({
    day: 6,
    title: "数のメモ",
    text:
      "洋平が紙に「12＋18＝30」と書いて陽菜の扉に挟もうとしている。本人が出て来て「計算は私も分かってます」と少し速く言う。" +
      "洋平は「そうか。俺が聞いてるのは、買える方だ」とだけ返す。",
    npcsPresent: ["yohei", "hina"],
    options: [
      { id: "ask_both_worries", label: "それぞれの心配を聞く" },
      { id: "confirm_numbers_together", label: "数を一緒に確認する" },
      { id: "stay_quiet", label: "口を挟まない" },
    ],
  }),
  scene({
    day: 7,
    title: "一度のお願い",
    text:
      "仁は台の幅を見て「ここだと二人は通れん」と動かす。文子が「当日もずっと見ていて」と言うと、" +
      "仁は作業票を指でたたく。「二時間。台を据えるところまで」。",
    npcsPresent: ["jin", "fumiko"],
    options: [
      { id: "listen_to_both", label: "二人の話を聞く" },
      { id: "offer_one_time_help", label: "必要なら一回だけ持つと申し出る" },
      { id: "do_nothing", label: "何もしない" },
    ],
    lowEngagementHook: "仁が作業の手を止めずに、「そこ、邪魔じゃないなら見てていい」とだけ言う。",
  }),
  scene({
    day: 8,
    title: "予約の手帳",
    text:
      "陽菜が自分の手帳の予約欄を指で追い、数字の横に丸をつけている。通りかかった大輔が" +
      "「売れる前から帳面だけ大繁盛か」とからかうと、陽菜も笑うが「予約の十二点は、きちんと渡さないと」と続ける。",
    npcsPresent: ["hina", "daisuke"],
    options: [
      { id: "ask_pickup_time", label: "受け取り時間を聞く" },
      { id: "ask_who_hands_it_over", label: "誰が渡すか聞く" },
      { id: "join_the_joke", label: "二人の冗談に加わる" },
    ],
  }),
  scene({
    day: 9,
    title: "待つ場所はどこか",
    text:
      "文子が会館前の場所を確認し、美代子は喫茶の入り口を磨いている。「うちで待つつもりの人、いるのかしら」と美代子。" +
      "文子は初めて「そちらの席まで使う話だった？」と聞き返す。",
    npcsPresent: ["fumiko", "miyoko"],
    options: [
      { id: "press_miyoko_for_boundary", label: "美代子に答えてもらう" },
      { id: "confirm_waiting_area", label: "並ぶ場所を確認する" },
      { id: "stay_out_of_it", label: "静観する" },
    ],
    lowEngagementHook: "美代子がこちらに気づいて、「あなたはどう思う？ でなくてもいいのよ」と軽く聞く。",
  }),
  scene({
    day: 10,
    title: "空欄の一行",
    text:
      "文子が当日用の記入欄を確認する。「価格、点数、予約はある。『受け渡しをする人』だけ空欄ね」。" +
      "陽菜は「私が」と言いかけて、焼く時間と販売の時間が重なると気づく。",
    npcsPresent: ["fumiko", "hina"],
    options: [
      { id: "suggest_time_split", label: "時間を分ける提案をする" },
      { id: "offer_limited_help", label: "当日だけ手伝える範囲を示す" },
      { id: "let_them_decide", label: "二人に考えてもらう" },
    ],
  }),
];

const DAY_11_MORNING: DayScene = scene({
  day: 11,
  phase: "morning",
  title: "朝：値札と原稿",
  text:
    "会館前に台が置かれ、陽菜は二つの値札を確かめる。文子が当日版を貼ろうとし、洋平は予約表を覗き込む。" +
    "原稿には「本日30点」とだけある。予約と店頭の内訳は書かれていない。",
  npcsPresent: ALL,
  options: [
    { id: "fix_sign_before_posting", label: "貼る前に予約12／店頭18と直すよう伝える" },
    { id: "greet_hina", label: "販売する陽菜に声をかける" },
    { id: "watch_quietly", label: "見守る" },
  ],
});

const DAY_11_AFTERNOON: DayScene = scene({
  day: 11,
  phase: "afternoon",
  title: "午後：重なる二人",
  text:
    "予約を受け取りに来た二人と、新たな客が重なる。陽菜は販売の手を止めて予約表を探す。" +
    "掲示が曖昧なままなら、旧版の写真を見せて「三十点買えると思って来た」と困る客が現れる。",
  npcsPresent: ALL,
  options: [
    { id: "flag_correct_now", label: "掲示をその場で直すよう伝える" },
    { id: "confirm_customer_facts", label: "客が見た事実を確かめる" },
    { id: "help_with_consented_task", label: "同意を得て一つの実務を手伝う" },
    { id: "publicly_blame_hina", label: "陽菜を公然と責める" },
    LEAVE,
  ],
});

const DAYS_12_23: DayScene[] = [
  scene({
    day: 12,
    title: "「昨日」と言えること",
    text:
      "次の朝、陽菜は売上の封筒を置き、まだ外せない札に手を伸ばす。洋平は必要な数だけメモに書き、" +
      "美代子は昨日座れなかった人の顔を思い出す。",
    npcsPresent: ["hina", "yohei", "miyoko"],
    options: [
      { id: "ask_hina", label: "陽菜の話を聞く" },
      { id: "ask_yohei", label: "洋平に数を聞く" },
      { id: "visit_miyoko", label: "美代子の喫茶へ行く" },
      LEAVE,
    ],
  }),
  scene({
    day: 13,
    title: "客が待った時間",
    text:
      "美代子が陽菜に水を置く。「昨日の人、味のことは褒めてたわ。待つ時間が分からなかったのよ」。" +
      "陽菜は「でも、ちゃんと渡した」と言ってから、客の立っていた位置を見る。",
    npcsPresent: ["miyoko", "hina"],
    options: [
      { id: "ask_what_customer_said", label: "客が何を言ったか尋ねる" },
      { id: "relay_exaggerated_account", label: "客はもっと怒っていたと話を盛って伝える" },
      { id: "help_cafe_task", label: "喫茶の手伝いを一つする" },
      LEAVE,
    ],
  }),
  scene({
    day: 14,
    title: "数字の間にある声",
    text:
      "洋平は陽菜に、店頭十八、予約十二、売上八千円と書いた紙を渡す。「数は合ってる。昨日の説明は別の話だ」。" +
      "陽菜は「数だけで言わないで」と返す。",
    npcsPresent: ["yohei", "hina"],
    options: [
      { id: "broker_direct_fact_check", label: "両者を引き合わせて直接照合させる" },
      { id: "talk_to_one_side", label: "片方とだけ話す" },
      { id: "pass_by", label: "通り過ぎる" },
    ],
  }),
  scene({
    day: 15,
    title: "冗談の期限",
    text:
      "洋平が大輔の工房へ寄る。大輔は「預けた椅子より催促が早い」と笑う。洋平は椅子を受け取りながら" +
      "「工房を使うなら十七日までに返事が欲しいそうだ」と言う。",
    npcsPresent: ["yohei", "daisuke"],
    options: [
      { id: "ask_deadline_reason", label: "期限の理由を聞く" },
      { id: "talk_furniture", label: "大輔と家具の話をする" },
      { id: "leave_it_to_them", label: "二人に任せる" },
    ],
  }),
  scene({
    day: 16,
    title: "二時間の仕事",
    text:
      "仁は試売で使った台を片づけ、美代子の席には触れずに置き場所を確認する。美代子が" +
      "「また手伝ってくれる？」と尋ねると「内容と時間次第」と答える。",
    npcsPresent: ["jin", "miyoko"],
    options: [
      { id: "arrange_paid_task_with_consent", label: "有償の設営内容を一緒に整理する" },
      { id: "assume_free_help", label: "好意で無償の追加をお願いする" },
      { id: "talk_about_something_else", label: "別の話をする" },
    ],
  }),
  scene({
    day: 17,
    title: "工房からの返事",
    text:
      "文子が利用予定表の工房欄を指す。大輔は来ていれば自分で「一時間なら片づけられる」または「今回は無理」と答える。" +
      "来なければ文子は欄に「返事なし」と書く。",
    npcsPresent: ["fumiko", "daisuke"],
    options: [
      { id: "press_daisuke_for_answer", label: "大輔に直接都合を聞く" },
      { id: "check_hall_frontage", label: "会館前の動線を確かめる" },
      { id: "say_nothing_day17", label: "何も言わない" },
    ],
  }),
  scene({
    day: 18,
    title: "席の線",
    text:
      "美代子は文子を喫茶の入口まで連れて行き、「この四席は、お茶を頼む人の席」と言う。文子は会館側の待機場所を紙に書き足す。",
    npcsPresent: ["miyoko", "fumiko"],
    options: [
      { id: "ask_about_layout", label: "二人の配置を聞く" },
      { id: "ask_as_customer", label: "席を頼む客として話す" },
      LEAVE,
    ],
  }),
  scene({
    day: 19,
    title: "古い紙、新しい紙",
    text:
      "文子が掲示板に日付つきの記録を貼る。曖昧な初稿が出ていたなら「予約十二点、当日販売十八点」と訂正経緯を明記する。" +
      "「次は誰が最終原稿を見る？」と文子。",
    npcsPresent: ["fumiko"],
    options: [
      { id: "confirm_editor_role", label: "編集役を引き受ける人の意向を聞き、担当を確認する" },
      { id: "read_the_sign", label: "表記を読む" },
      { id: "watch_silently", label: "黙って見守る" },
    ],
  }),
  scene({
    day: 20,
    title: "売上の下",
    text:
      "陽菜が領収書を並べる。売上八千円。材料二千八百円、包装五百円、仁への設営二千円、場所と印刷三百円。差し引き二千四百円。" +
      "「これなら一時間三百円ほど。店の普段の費用を入れる前で」と陽菜。",
    npcsPresent: ["hina", "yohei", "miyoko"],
    options: [
      { id: "ask_calculation", label: "計算を聞く" },
      { id: "think_about_scale", label: "次回の規模を一緒に考える" },
      { id: "just_say_impression", label: "ただ感想を伝える" },
    ],
  }),
  scene({
    day: 21,
    title: "陽菜の選択肢",
    text:
      "陽菜が三枚の紙を机に置く。「条件を決めて皆で小さくもう一度」「自分の店だけでさらに小さく」「しばらく売らない」。",
    npcsPresent: ["hina"],
    options: [
      { id: "ask_leaning", label: "どれに傾いているか聞く" },
      { id: "cheer_her_on", label: "とにかく励ます" },
      { id: "wait_for_her", label: "本人の選択を待つ" },
    ],
  }),
  scene({
    day: 22,
    title: "本人に聞く",
    text:
      "洋平が試売の紙を持って陽菜の戸口に立つ。「十二と十八。俺が確かめたかったのは、次の紙で客が間違えないかだ」。" +
      "陽菜は戸を開けたまま、返事を考える。",
    npcsPresent: ["yohei", "hina"],
    options: [
      { id: "facilitate_direct_conversation", label: "二人の直接の会話を促す" },
      { id: "talk_separately", label: "別々に話す" },
      { id: "leave_it_to_them_day22", label: "当人に任せる" },
    ],
  }),
  scene({
    day: 23,
    title: "空欄を空欄と呼ぶ",
    text:
      "文子の表に、販売と予約、掲示、席、設営、工房の欄が並ぶ。仁が「名前を書くなら、先に仕事を言って」と言い、" +
      "大輔は工房欄を見て肩をすくめる。",
    npcsPresent: ["fumiko", "jin", "daisuke"],
    options: [
      { id: "ask_each_scope", label: "各人に引き受ける範囲を聞く" },
      { id: "list_open_items", label: "未決事項を挙げる" },
      { id: "just_listen", label: "聞くだけにする" },
    ],
  }),
];

const DAY_24: DayScene = scene({
  day: 24,
  title: "続け方を決める",
  text:
    "六人が会館の小さな机に集まる。文子が試売の記録と役割表を開く。陽菜は経費の紙を持ち、美代子は喫茶へ戻る時刻を伝え、" +
    "仁は作業票をしまわずに置く。洋平は数字を持ち、大輔は自分の工房の答えを自分で言う。" +
    "「続けるなら、誰が何をするかまで決めたい」と陽菜。",
  npcsPresent: ALL,
  options: [
    { id: "confirm_a_fact", label: "事実を一つ確かめる" },
    { id: "state_your_role", label: "自分の協力範囲を明確にする" },
    { id: "give_opinion", label: "別の意見を述べる" },
    { id: "watch_and_see", label: "見届ける" },
  ],
});

interface Day25to30Variant {
  text: string;
  options: DayOption[];
}

type Day25to30Table = Record<Day24Outcome, Day25to30Variant>;

const DAYS_25_30: Record<number, { title: string; npcsPresent: NpcId[]; variants: Day25to30Table }> = {
  25: {
    title: "紙をしまうか、書き直すか",
    npcsPresent: ["fumiko", "hina", "yohei"],
    variants: {
      JOINT_RETRY: {
        text:
          "文子が旧版に日付をつけて保管し、陽菜と二人で「予約分と店頭分を別記、受取時間は確定後掲示」と新しい下書きを作る。「発表はまだ先よ」と文子。",
        options: [{ id: "talk_wording", label: "どの表記が分かりやすいか話す" }, LEAVE],
      },
      SOLO_TRIAL: {
        text: "陽菜が自店の小さな紙に「次回の数と時間は決まってから」と書く。洋平は他人の店の紙に勝手に手を入れない。",
        options: [{ id: "talk_own_scale", label: "自分の手で回せる量を話す" }, LEAVE],
      },
      PAUSE: {
        text: "文子が次回日程欄を空欄のままにする。陽菜は試作品の残りを日付つきで記録する。",
        options: [{ id: "talk_what_to_check", label: "何を確認してから再開を考えるか話す" }, LEAVE],
      },
      SPLIT: {
        text: "陽菜が共同掲示の使用をやめ、文子は旧版の訂正だけ保管する。洋平は商売を決める権利が陽菜にあると言う。",
        options: [{ id: "talk_what_to_tell_customers", label: "どの説明を客に残すか話す" }, LEAVE],
      },
    },
  },
  26: {
    title: "時間と場所",
    npcsPresent: ["jin", "miyoko"],
    variants: {
      JOINT_RETRY: {
        text: "仁が二時間分の次回設営案を示す。「延長はその時に頼んで」。美代子は四席を喫茶用に残す。",
        options: [{ id: "talk_queue_line", label: "会館前の待機線について話す" }, LEAVE],
      },
      SOLO_TRIAL: {
        text: "仁は陽菜に、小さな台なら自店の前で収まると測った長さだけ伝える。依頼がなければ見積りも契約も増やさない。",
        options: [{ id: "talk_solo_prep", label: "一人でできる準備を話す" }, LEAVE],
      },
      PAUSE: {
        text: "仁は頼まれていない台を作らず、別の家具の仕事へ戻る。美代子は客に喫茶の席を勧める。",
        options: [{ id: "talk_boundary", label: "仕事を待たせない境界を話す" }, LEAVE],
      },
      SPLIT: {
        text: "仁は未契約の設営を始めない。美代子が「うちの席は、いつも通りね」と短く言う。",
        options: [{ id: "talk_who_declined", label: "誰が何を引き受けなかったか話す" }, LEAVE],
      },
    },
  },
  27: {
    title: "修理した椅子",
    npcsPresent: ["daisuke", "yohei", "hina"],
    variants: {
      JOINT_RETRY: {
        text: "大輔が直した椅子を洋平に渡し、「工房は貸せなくても椅子は直す」と笑う。貸出しに同意済みなら指定の一時間だけ片づける。",
        options: [{ id: "talk_after_declining_friend", label: "友人に断った後の距離を話す" }, LEAVE],
      },
      SOLO_TRIAL: {
        text: "大輔が陽菜の店のぐらつく椅子を見つけ、仕事として修理の値段を伝える。陽菜は頼むかを選ぶ。",
        options: [{ id: "talk_small_business_labor", label: "小さな商売にも他人の時間が要ることを話す" }, LEAVE],
      },
      PAUSE: {
        text: "洋平が工房から自分の椅子を持ち帰る。大輔は期限に答えなかったことを軽く流そうとする。",
        options: [{ id: "talk_ease_and_responsibility", label: "気楽さと責任について話す" }, LEAVE],
      },
      SPLIT: {
        text: "大輔と洋平は修理の仕上がりでは笑える一方、試売の責任の話には踏み込めない。",
        options: [{ id: "talk_remaining_connection", label: "不一致が残っても続く接点を話す" }, LEAVE],
      },
    },
  },
  28: {
    title: "お客への一言",
    npcsPresent: ["hina", "fumiko", "miyoko"],
    variants: {
      JOINT_RETRY: {
        text: "陽菜が試売に来た客へ、次回は時間と予約分を明記すると説明する。文子は自分の掲示分だけ謝る。",
        options: [{ id: "talk_what_was_missing", label: "味を褒めた人にも何が足りなかったか話す" }, LEAVE],
      },
      SOLO_TRIAL: {
        text: "陽菜が客に次回は店頭で少数ずつと伝え、決まっていない販売日は言わない。美代子が「それなら待たせないで済みそうね」と返す。",
        options: [{ id: "talk_small_upside", label: "小さいことの利点と限界を話す" }, LEAVE],
      },
      PAUSE: {
        text: "陽菜は「次の販売日はまだありません」と客に答える。洋平はこの事実を余計な推測なしに伝える。",
        options: [{ id: "talk_courage_to_say_undecided", label: "未定と言う勇気について話す" }, LEAVE],
      },
      SPLIT: {
        text: "陽菜は共同の次回予定がないと客に直接伝える。文子は旧掲示が原因だった場合に訂正内容を再確認する。",
        options: [{ id: "talk_explain_vs_blame", label: "説明と非難の違いを話す" }, LEAVE],
      },
    },
  },
  29: {
    title: "次の数字",
    npcsPresent: ["yohei", "hina"],
    variants: {
      JOINT_RETRY: {
        text: "洋平が陽菜に新しい費用見込みの空欄を渡す。「前の二千四百円を利益と呼ぶ前に、君の時間を入れよう」。",
        options: [{ id: "talk_next_pricing", label: "次回の値付けと負担を話す" }, LEAVE],
      },
      SOLO_TRIAL: {
        text: "陽菜は数を減らした仮の原価表を作る。洋平は頼まれた欄だけ数える。新価格や利益はまだ決まらない。",
        options: [{ id: "talk_own_labor_time", label: "自分の作業時間を話す" }, LEAVE],
      },
      PAUSE: {
        text: "陽菜は原価表に空欄を残し、経費を見直す時間を取る。洋平は訪ねてよいかを聞いてから入る。",
        options: [{ id: "talk_deadline_pressure", label: "急がないための期限を話す" }, LEAVE],
      },
      SPLIT: {
        text: "洋平は自分の計算書を持ち帰るが、求められれば試売の実数は渡す。陽菜はもう共同案の承認を求めない。",
        options: [{ id: "talk_accurate_info", label: "意見が違う相手からの正確な情報について話す" }, LEAVE],
      },
    },
  },
  30: {
    title: "一緒にいる理由",
    npcsPresent: ALL,
    variants: {
      JOINT_RETRY: {
        text:
          "六人が会館前で次回に必要な条件を声に出して確かめる。陽菜「私が予約の時間を決める」。仁「設営は二時間、仕事として」。" +
          "美代子「席は喫茶の四つ」。文子「掲示は私が最終確認」。洋平「数が変われば直接聞く」。大輔は工房についての確定した返事だけを繰り返す。次回実施日は未定。",
        options: [{ id: "who_to_watch", label: "誰と話すか決める" }],
      },
      SOLO_TRIAL: {
        text:
          "陽菜は自店のカウンターで少数の新案を試すため、翌月の空き日を調べる。美代子が客として寄るかもしれず、洋平は頼まれれば計算する。" +
          "共同再試行の約束はない。",
        options: [{ id: "how_to_take_solo_decision", label: "一人の決定をどう受け取るか考える" }],
      },
      PAUSE: {
        text:
          "陽菜の店は通常の営業だけで、新たな試売告知はない。文子は会館の掲示を整え、美代子はいつも通り客と話す。六人が同じ町にいても、問題を片づけたことにはならない。",
        options: [{ id: "who_to_keep_talking_to", label: "未解決のまま、誰との会話を続けたいか考える" }],
      },
      SPLIT: {
        text:
          "旧共同案の次回は存在しない。陽菜は自分の店の仕事を選び、洋平は頼まれていない助言を控える。関係の修復を約束する結末にはしない。",
        options: [{ id: "who_to_talk_to_now", label: "これからこの町で誰に声をかけるか考える" }],
      },
    },
  },
};

export function getScene(day: number, day11Phase: "morning" | "afternoon" | "done", day24Outcome: Day24Outcome | null): DayScene {
  if (day === 11) {
    return day11Phase === "afternoon" ? DAY_11_AFTERNOON : DAY_11_MORNING;
  }
  if (day >= 1 && day <= 10) return DAYS_1_10[day - 1];
  if (day >= 12 && day <= 23) return DAYS_12_23[day - 12];
  if (day === 24) return DAY_24;
  if (day >= 25 && day <= 30) {
    const entry = DAYS_25_30[day];
    const outcome = day24Outcome ?? "SOLO_TRIAL";
    const variant = entry.variants[outcome];
    return {
      day,
      title: entry.title,
      text: variant.text,
      npcsPresent: entry.npcsPresent,
      options: variant.options,
    };
  }
  throw new Error(`no scene for day ${day}`);
}

export const TOTAL_DAYS = 30;
