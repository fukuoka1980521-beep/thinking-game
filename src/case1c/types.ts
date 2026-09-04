/**
 * CASE1 Vertical Slice / External Test Candidate ("もう一台の自転車", PHASE 4.4). Deliberately
 * self-contained -- does not import from src/episodes/ or src/pilot/, and nothing outside this
 * directory imports from it except the one HOME entry point in App.tsx/HomeScreen.tsx. See
 * docs/product/CASE1_EXTERNAL_TEST_REVISION_V1.md for the design this implements (supersedes
 * CASE1_C_COMPLETE_DESIGN_V1.md's "だれからの、ありがとう", kept only as history).
 */

export type Case1CScreen =
  | "TITLE"
  | "PARK_A"
  | "BIKE_CLOSEUP"
  | "BOOK_CLOSEUP"
  | "STICKER_CLOSEUP"
  | "NOTICEBOARD"
  | "TOWN"
  | "TALK_SHOPKEEPER"
  | "TALK_MINAGAWA"
  | "TALK_TAISHOU"
  | "PARK_C"
  | "PREDICTION"
  | "REVEAL"
  | "SHIFT"
  | "CLOSED"
  | "HOOK"
  | "NEXT_PENDING"
  | "FEEDBACK"
  | "DONE";

export type ClueKey = "primary" | "secondary" | "human" | "sticker";

export const CLUES: Record<ClueKey, { icon: string; label: string }> = {
  primary: { icon: "🚲", label: "そっくりな自転車" },
  secondary: { icon: "📕", label: "絵本と返却期限" },
  human: { icon: "🔧", label: "自転車店の証言" },
  sticker: { icon: "✨", label: "ハンドルのシール" },
};

/** What the player predicted the bike's owner would do -- never scored right/wrong. */
export type PredictionChoice = "bow" | "grab" | "freeze";

/**
 * PHASE 4.6 (OWNER_CASE1_EXTERNAL_TEST_PACKAGE_READY, Section3/4): whether this tester has
 * played an earlier build before. Owner-facing bookkeeping only -- never a name, never PII.
 */
export type TesterType = "NEW" | "RETURNING";

export interface CaseFileRecord {
  caseId: "CASE1C";
  caseTitle: "もう一台の自転車";
  cluesFound: ClueKey[];
  firstHypothesis: string;
  humanPrediction: PredictionChoice | null;
  actualBehavior: string;
  ending: string;
  companion: "探偵";
  completedAt: string;
  /** PHASE 4.6: groups this record with its metrics/feedback for the Owner result view. */
  sessionId: string;
  testerCode: string;
  testerType: TesterType | null;
}

export interface FeedbackAnswers {
  testerId: string;
  q1Fun: number;
  q2Curiosity: number;
  q3SelfInvestigated: number;
  q4Aha: number;
  q5WantNext: number;
  freeText: string;
  submittedAt: string;
  /** PHASE 4.6 Section10: optional, character-memory only -- not a name-recall quiz. */
  characterMemory: string;
  sessionId: string;
  testerType: TesterType | null;
}
