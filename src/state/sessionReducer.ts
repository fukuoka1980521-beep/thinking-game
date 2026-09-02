import type {
  AiActionInput,
  AiMessageSource,
  FirstDecisionInput,
  InProgressSession,
  ObservedFactInput,
  ScreenId,
  SecondDecisionInput,
} from "../types/log";

export const SCREEN_ORDER: ScreenId[] = [
  "CASE_INTRO",
  "OBSERVED_FACT",
  "FIRST_DECISION",
  "AI_INTERVENTION",
  "NEW_FACT",
  "SECOND_DECISION",
  "REFLECTION",
  "RESULT",
];

export type SessionAction =
  | { type: "RESTORE"; session: InProgressSession }
  | { type: "ADVANCE_FROM_INTRO" }
  | { type: "SUBMIT_OBSERVED_FACT"; input: ObservedFactInput }
  | { type: "SUBMIT_FIRST_DECISION"; input: FirstDecisionInput }
  | { type: "SET_SHOWN_AI_MESSAGE"; message: string; source: AiMessageSource }
  | { type: "SUBMIT_AI_ACTION"; input: AiActionInput }
  | { type: "ADVANCE_FROM_NEW_FACT" }
  | { type: "SUBMIT_SECOND_DECISION"; input: SecondDecisionInput }
  | { type: "SUBMIT_REFLECTION"; note: string }
  | { type: "GO_BACK" }
  | { type: "GO_BACK_TO_INTRO" };

export function sessionReducer(
  state: InProgressSession,
  action: SessionAction,
): InProgressSession {
  switch (action.type) {
    case "RESTORE":
      return action.session;
    case "ADVANCE_FROM_INTRO":
      return { ...state, screen: "OBSERVED_FACT" };
    case "SUBMIT_OBSERVED_FACT":
      return { ...state, observedFact: action.input, screen: "FIRST_DECISION" };
    case "SUBMIT_FIRST_DECISION":
      return { ...state, first: action.input, screen: "AI_INTERVENTION" };
    case "SET_SHOWN_AI_MESSAGE":
      // Does not advance the screen -- just records what AI_INTERVENTION is
      // actually displaying, for accurate RESULT-time logging (Section 26).
      return { ...state, shownAiMessage: action.message, aiMessageSource: action.source };
    case "SUBMIT_AI_ACTION":
      return { ...state, aiAction: action.input, screen: "NEW_FACT" };
    case "ADVANCE_FROM_NEW_FACT":
      return { ...state, screen: "SECOND_DECISION" };
    case "SUBMIT_SECOND_DECISION":
      return { ...state, second: action.input, screen: "REFLECTION" };
    case "SUBMIT_REFLECTION":
      return { ...state, reflectionNote: action.note, screen: "RESULT" };
    case "GO_BACK": {
      const currentIndex = SCREEN_ORDER.indexOf(state.screen);
      if (currentIndex <= 0) return state;
      return { ...state, screen: SCREEN_ORDER[currentIndex - 1] };
    }
    // FUN_FIRST_PROTOTYPE Run Section 1: simplifiedFlow cases never render
    // OBSERVED_FACT (it's auto-submitted), so going back from FIRST_DECISION
    // must land on CASE_INTRO directly rather than the single-step GO_BACK,
    // which would land on the invisible OBSERVED_FACT screen and get
    // immediately re-forwarded by CaseSession's auto-skip effect.
    case "GO_BACK_TO_INTRO":
      return { ...state, screen: "CASE_INTRO" };
    default:
      return state;
  }
}

export function canGoBack(screen: ScreenId): boolean {
  return SCREEN_ORDER.indexOf(screen) > 0 && screen !== "RESULT";
}
