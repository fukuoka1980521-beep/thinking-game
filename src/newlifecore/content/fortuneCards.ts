/**
 * PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 8 -- the 3 symbol cards. A card
 * NEVER decides anything about the future (Section 8's explicit ban) -- picking one only selects
 * which single opening question Shizuko asks first, a light variation on the Thinking Circuit's
 * entry point (Section 9), never a fixed personality/psych-type readout (Section 8's explicit ban
 * on "固定心理診断"). No internal Thinking Circuit category name (FACT/INTERPRETATION/EMOTION/
 * DESIRE/UNKNOWN) is ever shown to the player (Section 9) -- this file only ever produces the
 * player-facing card label/description and Shizuko's own spoken opening line.
 */
export interface FortuneCard {
  id: string;
  label: string;
  description: string;
  openingLine: string;
  /** PHASE_16_NEW_LIFE_GAME_IDENTITY_REBUILD_V1 Section 18 -- FORTUNE PERSISTENCE: shown instead of
   *  the ordinary opening line the next time the player visits (a later day, first conversation of
   *  that day) after having drawn THIS card, via `state.lastFortuneCard`. Enables "この前の話、その
   *  後どうでした？" without storing any of the player's own raw free text (existing privacy rule,
   *  Section 18's own "raw sensitive free text保存はexisting privacy rule維持" -- only the card id
   *  and the day it was drawn are ever kept, `types.ts`'s `lastFortuneCard`). */
  followUpLine: string;
}

export const FORTUNE_CARDS: FortuneCard[] = [
  {
    id: "road",
    label: "道",
    description: "進む方向について",
    openingLine: "静子はカードを一枚、こちらへ向けた。「……『道』ね。今、どっちへ進もうか迷っていることは、何かある？」",
    followUpLine: "静子は顔を上げた。「そういえば、この前『道』のカードを引いてたわね。あれから、何か変わった?」",
  },
  {
    id: "mirror",
    label: "鏡",
    description: "自分の気持ちについて",
    openingLine: "静子はカードを一枚、こちらへ向けた。「……『鏡』ね。今、自分がどう感じてるか、ちゃんと言葉にできてる？」",
    followUpLine: "静子は顔を上げた。「この前、『鏡』のカードだったわね。その後、少しは言葉にできた?」",
  },
  {
    id: "light",
    label: "灯り",
    description: "少し変えたいことについて",
    openingLine: "静子はカードを一枚、こちらへ向けた。「……『灯り』ね。何か、少しだけ変えてみたいことは、ある？」",
    followUpLine: "静子は顔を上げた。「『灯り』のカード、覚えてる? あれから、何か試してみた?」",
  },
];

export function fortuneCardById(id: string): FortuneCard | undefined {
  return FORTUNE_CARDS.find((c) => c.id === id);
}
