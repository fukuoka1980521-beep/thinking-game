import { FORTUNE_CARDS } from "./content/fortuneCards";

/**
 * PHASE_15_NEW_LIFE_HYBRID_EVENT_AND_FORTUNE_HOUSE_V1 Section 8 -- 3 cards, same button SYSTEM
 * (grid layout, click-to-choose) as everywhere else in the game, but visually recognizable as cards
 * (PHASE_16 Section 15's `.nlc-fortune-card` -- a soft inner border/corner treatment) rather than
 * plain `.nlc-choice` buttons, with no glow/sparkle/animation (Section 16/37's "過剰な魔法演出禁
 * 止"). Picking one only changes Shizuko's opening question (content/fortuneCards.ts) -- this
 * component itself makes no claim about the future and shows no reading/result of any kind.
 */
export function FortuneCardPicker({ onSelect, onCancel }: { onSelect: (cardId: string) => void; onCancel: () => void }) {
  return (
    <div data-testid="nlc-fortune-card-picker">
      <p className="nlc-npc-line">静子が、小さなカードを3枚、伏せて並べた。「気になったのを、1枚選んでみて」</p>
      <div className="nlc-choices">
        {FORTUNE_CARDS.map((card) => (
          <button key={card.id} className="nlc-fortune-card" onClick={() => onSelect(card.id)} data-testid={`nlc-fortune-card-${card.id}`}>
            <span className="nlc-fortune-card-label">{card.label}</span>
            {card.description}
          </button>
        ))}
        <button className="nlc-leave-btn" onClick={onCancel} data-testid="nlc-fortune-card-cancel">
          やっぱりやめる
        </button>
      </div>
    </div>
  );
}
