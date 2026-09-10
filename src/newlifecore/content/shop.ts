/**
 * NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1 Section 11 -- BOUNDED INVENTORY/MENU per
 * shop. The AI never invents a product; it only ever answers from this list (fed into
 * NpcAiContext.availableMenu, dialogue/contextBuilder.ts). Deliberately small (directive: "商品点
 * 数を大量に作る必要はない") -- just enough to make "メニューありますか" answerable precisely and
 * "焼きそばください" answerable as a natural decline.
 */
import type { LocationId, NpcId } from "../types";

export interface ShopItem {
  id: string;
  label: string;
  price: number;
  /** Section 12/13 -- an item that can actually be cooked/eaten at the trial house once bought. */
  isFoodIngredient?: boolean;
}

export const CAFE_MENU: ShopItem[] = [
  { id: "toast", label: "トースト", price: 350 },
  { id: "hot_sandwich", label: "ホットサンド", price: 650 },
  { id: "coffee", label: "コーヒー", price: 400 },
  { id: "tea", label: "紅茶", price: 400 },
];

export const YOHEI_GOODS: ShopItem[] = [
  { id: "rice", label: "米（1袋）", price: 1200, isFoodIngredient: true },
  { id: "meat", label: "肉", price: 800, isFoodIngredient: true },
  { id: "vegetables", label: "野菜", price: 500, isFoodIngredient: true },
  { id: "daily_goods", label: "日用品セット", price: 900 },
];

// PHASE_12_3 -- reuses the existing purchase machinery wholesale for Daisuke's barbershop (a
// single item is enough; the point is giving BARBERSHOP a second, ordinary action alongside
// conversation -- directive Section 19's "1 LOCATION = 1 EVENTを禁止" -- not building a real menu).
export const BARBERSHOP_MENU: ShopItem[] = [{ id: "haircut", label: "散髪", price: 1500 }];

const MENU_BY_LOCATION: Partial<Record<LocationId, ShopItem[]>> = {
  CAFE_NODOKA: CAFE_MENU,
  YOHEI_STORE: YOHEI_GOODS,
  BARBERSHOP: BARBERSHOP_MENU,
};

const SHOP_NPC_BY_LOCATION: Partial<Record<LocationId, NpcId>> = {
  CAFE_NODOKA: "miyoko",
  YOHEI_STORE: "yohei",
  BARBERSHOP: "daisuke",
};

const ALL_ITEMS: Record<string, ShopItem> = Object.fromEntries([...CAFE_MENU, ...YOHEI_GOODS, ...BARBERSHOP_MENU].map((i) => [i.id, i]));

export function itemById(id: string): ShopItem | undefined {
  return ALL_ITEMS[id];
}

/** Only shop NPCs (Yohei, Miyoko, Daisuke) have a bounded menu at all -- Kamiya and Jin never sell
 *  anything, so their AI context simply never carries this field populated. */
export function menuForNpc(npc: NpcId): ShopItem[] | null {
  if (npc === "miyoko") return CAFE_MENU;
  if (npc === "yohei") return YOHEI_GOODS;
  if (npc === "daisuke") return BARBERSHOP_MENU;
  return null;
}

export function menuForLocation(location: LocationId): ShopItem[] {
  return MENU_BY_LOCATION[location] ?? [];
}

export function shopNpcForLocation(location: LocationId): NpcId | null {
  return SHOP_NPC_BY_LOCATION[location] ?? null;
}

export function describeMenu(items: ShopItem[]): string {
  return items.map((i) => `${i.label}（${i.price}円）`).join(" / ");
}
