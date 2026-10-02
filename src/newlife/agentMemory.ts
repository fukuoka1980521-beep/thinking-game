import { NPC_IDS, type NpcId, type SceneFocus } from "./types";

export type AgentMemoryKind = "OBSERVATION" | "REFLECTION" | "PLAN";
export type AgentMemorySource =
  | "PLAYER_SPEECH"
  | "NPC_SPEECH"
  | "WORLD_EFFECT"
  | "DAY_TRANSITION"
  | "REFLECTION";

export interface AgentMemoryRecord {
  id: string;
  owner: NpcId;
  day: number;
  kind: AgentMemoryKind;
  text: string;
  importance: number; // 1..10
  createdSeq: number;
  lastAccessSeq: number;
  source: AgentMemorySource;
  focusSnapshot?: SceneFocus;
  playerMeaning?: string;
}

export type AgentMemoryStore = Record<NpcId, AgentMemoryRecord[]>;

export interface RetrievedAgentMemory {
  record: AgentMemoryRecord;
  score: number;
  recency: number;
  importance: number;
  relevance: number;
}

export interface MemoryRetrievalResult {
  selected: RetrievedAgentMemory[];
  store: AgentMemoryStore;
}

export const DEFAULT_REFLECTION_THRESHOLD = 20;

export function createEmptyAgentMemoryStore(): AgentMemoryStore {
  return NPC_IDS.reduce<AgentMemoryStore>(
    (store, npc) => {
      store[npc] = [];
      return store;
    },
    {
      hina: [],
      yohei: [],
      daisuke: [],
      jin: [],
      miyoko: [],
      fumiko: [],
    },
  );
}

function clampImportance(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(10, Math.round(value)));
}

export function nextMemorySeq(store: AgentMemoryStore): number {
  let max = 0;
  for (const npc of NPC_IDS) {
    for (const record of store[npc] ?? []) max = Math.max(max, record.createdSeq, record.lastAccessSeq);
  }
  return max + 1;
}

export function appendAgentMemory(
  store: AgentMemoryStore,
  input: Omit<AgentMemoryRecord, "id" | "createdSeq" | "lastAccessSeq" | "importance"> & { importance: number },
): AgentMemoryStore {
  const seq = nextMemorySeq(store);
  const record: AgentMemoryRecord = {
    ...input,
    importance: clampImportance(input.importance),
    id: `${input.owner}:${input.day}:${seq}`,
    createdSeq: seq,
    lastAccessSeq: seq,
  };
  return {
    ...store,
    [input.owner]: [...(store[input.owner] ?? []), record].slice(-120),
  };
}

function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function charNgrams(text: string, n = 2): Set<string> {
  const normalized = normalizeText(text);
  if (!normalized) return new Set();
  if (normalized.length <= n) return new Set([normalized]);
  const grams = new Set<string>();
  for (let i = 0; i <= normalized.length - n; i += 1) grams.add(normalized.slice(i, i + n));
  return grams;
}

/**
 * Deterministic semantic-relevance approximation for the first product slice.
 * The contract is intentionally replaceable by embedding cosine similarity
 * later without changing the retrieval caller.
 */
export function memoryRelevance(query: string, memoryText: string): number {
  const a = charNgrams(query);
  const b = charNgrams(memoryText);
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  for (const gram of a) if (b.has(gram)) overlap += 1;
  return (2 * overlap) / (a.size + b.size);
}

export function retrieveAgentMemories(
  store: AgentMemoryStore,
  owner: NpcId,
  query: string,
  limit = 6,
): MemoryRetrievalResult {
  const nowSeq = nextMemorySeq(store);
  const ranked = (store[owner] ?? []).map((record) => {
    const age = Math.max(0, nowSeq - record.lastAccessSeq);
    const recency = Math.pow(0.995, age);
    const importance = record.importance / 10;
    const relevance = memoryRelevance(query, record.text);
    return {
      record,
      recency,
      importance,
      relevance,
      score: recency + importance + relevance,
    };
  });

  ranked.sort((a, b) => b.score - a.score || b.record.createdSeq - a.record.createdSeq);
  const selected = ranked.slice(0, Math.max(0, limit));
  if (selected.length === 0) return { selected, store };

  const touched = new Set(selected.map((item) => item.record.id));
  const updatedOwner = (store[owner] ?? []).map((record) =>
    touched.has(record.id) ? { ...record, lastAccessSeq: nowSeq } : record,
  );

  return {
    selected,
    store: { ...store, [owner]: updatedOwner },
  };
}

export function reflectionImportanceSinceLastReflection(
  store: AgentMemoryStore,
  owner: NpcId,
): number {
  const memories = store[owner] ?? [];
  const lastReflectionSeq = [...memories]
    .reverse()
    .find((memory) => memory.kind === "REFLECTION")?.createdSeq ?? 0;
  return memories
    .filter((memory) => memory.createdSeq > lastReflectionSeq && memory.kind !== "REFLECTION")
    .reduce((sum, memory) => sum + memory.importance, 0);
}

export function shouldReflect(
  store: AgentMemoryStore,
  owner: NpcId,
  threshold = DEFAULT_REFLECTION_THRESHOLD,
): boolean {
  return reflectionImportanceSinceLastReflection(store, owner) >= threshold;
}

export function reflectionSourceMemories(
  store: AgentMemoryStore,
  owner: NpcId,
  limit = 20,
): AgentMemoryRecord[] {
  const memories = store[owner] ?? [];
  const lastReflectionSeq = [...memories]
    .reverse()
    .find((memory) => memory.kind === "REFLECTION")?.createdSeq ?? 0;
  return memories
    .filter((memory) => memory.createdSeq > lastReflectionSeq && memory.kind !== "REFLECTION")
    .slice(-Math.max(1, limit));
}

export function buildAgentObservationText(input: {
  sceneTitle: string;
  sceneFocus?: SceneFocus;
  playerMeaning?: string;
  playerText: string;
  selfReply: string;
}): string {
  const parts = [`場面「${input.sceneTitle}」`];
  if (input.sceneFocus) {
    parts.push(`問題: ${input.sceneFocus.issue}`);
    parts.push(`未決: ${input.sceneFocus.decision}`);
    parts.push(`権限: ${input.sceneFocus.authority}`);
  }
  const meaning = input.playerMeaning?.trim();
  parts.push(
    meaning && meaning !== "構造化された意味メタデータは未確定。"
      ? `プレイヤーの意味: ${meaning}`
      : `プレイヤー発言: ${input.playerText}`,
  );
  parts.push(`私の返答: ${input.selfReply}`);
  return parts.join(" ");
}

export interface RetrievedMemoryAnchor {
  day: number;
  kind: AgentMemoryKind;
  issue?: string;
  decision?: string;
  authority?: string;
  playerMeaning?: string;
}

export function formatRetrievedMemoryAnchors(selected: RetrievedAgentMemory[]): RetrievedMemoryAnchor[] {
  return selected.map(({ record }) => ({
    day: record.day,
    kind: record.kind,
    issue: record.focusSnapshot?.issue,
    decision: record.focusSnapshot?.decision,
    authority: record.focusSnapshot?.authority,
    playerMeaning: record.playerMeaning,
  }));
}

export function formatRetrievedMemories(selected: RetrievedAgentMemory[]): string[] {
  return selected.map(({ record }) => `Day ${record.day} [${record.kind}] ${record.text}`);
}
