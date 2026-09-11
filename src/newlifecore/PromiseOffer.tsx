/**
 * PHASE_12_6_NEW_LIFE_RELATIONSHIP_CONSEQUENCE_AND_SOCIAL_MEMORY_V1 Section 6/7 -- the NPC's own
 * invitation, offered as a real, structural UI choice after a conversation (never inferred from the
 * player's free text). Both `label` (authored, from `content/socialMemory.ts`'s `INVITE_LABELS`)
 * and the accept/decline choice are real data, not AI output -- mirrors `RealityBridgeOffer.tsx`'s
 * discipline, but simpler (no compose step: the invite's own wording is fixed per NPC, not
 * player-written). Section 7 -- decline is a first-class, equally-weighted button, not a "less good"
 * option buried behind a dismiss link.
 */
export function PromiseOffer({ npc, label, onAccept, onDecline }: { npc: string; label: string; onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="nlc-result" data-testid="nlc-promise-offer">
      <p className="nlc-ambient">{label}</p>
      <div className="nlc-choices">
        <button className="nlc-choice" onClick={onAccept} data-testid={`nlc-promise-accept-${npc}`}>
          行くと約束する
        </button>
        <button className="nlc-choice" onClick={onDecline} data-testid={`nlc-promise-decline-${npc}`}>
          今回は約束しない
        </button>
      </div>
    </div>
  );
}
