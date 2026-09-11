/**
 * PHASE_12_7_NEW_LIFE_PLAYER_TRAJECTORY_V1 Section 6/12/31 -- the "real opportunity" moment, shown
 * only after the player has pressed a neutral "話を聞いてみる" scene action (content/day1.ts's
 * `trajectoryActionsFor`), itself only offered once repeated ordinary engagement has made it
 * eligible (content/trajectoryEngine.ts's `opportunityEligible`). Structurally identical in spirit
 * to PromiseOffer.tsx (a real, equally-weighted accept/decline UI choice, never inferred from free
 * text) but kept as its own component with its own testids -- this is a life-direction choice, not
 * a social invitation, and CLOSE-report/test evidence should never have to guess which one fired
 * from a shared testid. The engine, not this component, decides whether accepting is even offered;
 * this only ever renders the choice and reports which button was pressed (Section 12: the ENGINE
 * makes opportunities possible, the PLAYER decides whether to take them).
 */
export function LifeOpportunityOffer({ npc, label, onAccept, onDecline }: { npc: string; label: string; onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="nlc-result" data-testid="nlc-opportunity-offer">
      <p className="nlc-ambient">{label}</p>
      <div className="nlc-choices">
        <button className="nlc-choice" onClick={onAccept} data-testid={`nlc-opportunity-accept-${npc}`}>
          引き受けてみる
        </button>
        <button className="nlc-choice" onClick={onDecline} data-testid={`nlc-opportunity-decline-${npc}`}>
          今回はやめておく
        </button>
      </div>
    </div>
  );
}
