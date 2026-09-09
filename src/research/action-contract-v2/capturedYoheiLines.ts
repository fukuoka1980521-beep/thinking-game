/**
 * PHASE 11.11: REAL Vertex AI (gemini-2.5-flash) output, captured once via the direct-REST path
 * (same method as PHASE 11.9-11.10) and hand-copied here verbatim -- never hand-written or
 * fabricated. Full raw request/response: `docs/research/evaluation/phase-11-11/raw_vertex_capture.json`.
 * Consumed only by `createReplayLanguageAdapter` (languageAdapter.ts) -- this is a REPLAY of real
 * captured output, not a live call. See PLAYABLE_SCENE_SPEC_V1.md's "Real LLM language path"
 * section for why live browser-to-Vertex wiring was explicitly out of scope this phase.
 */

import type { CapturedLine } from "./languageAdapter";

const PROVENANCE = { projectId: "gas-test-runner-20260620-wjxf", location: "asia-northeast1", modelId: "gemini-2.5-flash", capturedAt: "2026-09-09" };

export const CAPTURED_YOHEI_LINES: CapturedLine[] = [
  {
    packetKey: "ASK_WHAT::KNOWN",
    text: "ああ、悪いな。店先にある祭りの手ぬぐいの箱、値引き用の棚まで運んでくれるか。",
    provenance: PROVENANCE,
  },
  {
    packetKey: "ASK_FESTIVAL::KNOWN",
    text: "8割くらいは売れたよ。残りは今値引きして出す準備してるところだ。",
    provenance: PROVENANCE,
  },
  {
    packetKey: "ASK_SALES::KNOWN",
    text: "8割ほどは売れたよ。残りの2割は、今から値引きして棚に並べるところだ。",
    provenance: PROVENANCE,
  },
  {
    packetKey: "ASK_WEATHER::KNOWN",
    text: "天気は気にしてなかったな。悪いが、この手ぬぐいの箱、店先から値引き用の棚まで運んでくれるか。",
    provenance: PROVENANCE,
  },
  {
    packetKey: "ASK_ABOUT_LEFTOVER_STOCK::KNOWN",
    text: "ああ、そうだ。祭りの残りだよ。値引きで出すから、棚に並べるんだ。",
    provenance: PROVENANCE,
  },
];
