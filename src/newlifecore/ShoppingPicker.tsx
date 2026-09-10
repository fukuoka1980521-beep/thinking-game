import { useState } from "react";
import type { ShopItem } from "./content/shop";

/**
 * NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1 Section 8/9/10 -- the real structural
 * purchase action behind "買い物をする"/"メニューを注文する". Same pattern as IntakeForm.tsx: what
 * the player picks here is exactly what becomes canonical (engine.ts's purchaseItems), never
 * something AI conversation text can claim happened on its own. One item of each kind at a time
 * (a quantity stepper is not needed for a DAY1-sized catalog).
 */
export function ShoppingPicker({ items, money, onConfirm, onCancel }: { items: ShopItem[]; money: number; onConfirm: (itemIds: string[]) => void; onCancel: () => void }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);
  const total = selectedIds.reduce((sum, id) => sum + (items.find((i) => i.id === id)?.price ?? 0), 0);
  const overBudget = total > money;

  return (
    <div data-testid="nlc-shopping-picker">
      <div className="nlc-form-field">
        {items.map((item) => (
          <label key={item.id} className="nlc-form-radio">
            <input type="checkbox" data-testid={`nlc-shop-item-${item.id}`} checked={Boolean(selected[item.id])} onChange={() => toggle(item.id)} />
            {item.label}（{item.price}円）
          </label>
        ))}
      </div>
      <p className="nlc-ambient" data-testid="nlc-shop-total">
        合計 {total}円（所持金 {money}円）
      </p>
      {overBudget && (
        <p className="nlc-ambient" data-testid="nlc-shop-over-budget">
          今は、これだけ持ち合わせがない。
        </p>
      )}
      <div className="nlc-choices">
        <button className="nlc-btn" onClick={() => onConfirm(selectedIds)} disabled={selectedIds.length === 0 || overBudget} data-testid="nlc-shop-confirm">
          購入する
        </button>
        <button className="nlc-leave-btn" onClick={onCancel} data-testid="nlc-shop-cancel">
          やっぱりやめる
        </button>
      </div>
    </div>
  );
}
