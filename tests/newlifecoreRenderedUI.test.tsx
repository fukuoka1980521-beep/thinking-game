import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

type U = ReturnType<typeof userEvent.setup>;

async function start(user: U) {
  window.history.pushState({}, "", "/?newlifecore=1");
  render(<App />);
  await user.click(await screen.findByTestId("nlc-start"));
  await user.click(await screen.findByTestId("nlc-guide-continue"));
}

describe("NEW LIFE CORE: onboarding (directive NEW_LIFE_DAY1_ONBOARDING_AND_WORLD_ACTION_FIX_V1 Sections 2/3)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("the opening screen states the 30-day premise before any mechanics, and the guide states mechanics separately", async () => {
    window.history.pushState({}, "", "/?newlifecore=1");
    render(<App />);
    const opening = await screen.findByTestId("nlc-opening-copy");
    expect(opening.textContent).toMatch(/30日/);
    expect(opening.textContent).not.toMatch(/移動できます|時間が進みます/);

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("nlc-start"));
    const guide = await screen.findByTestId("nlc-play-guide");
    expect(guide.textContent).toMatch(/移動できます/);
    expect(guide.textContent).toMatch(/時間が進みます/);
  });

  it("the play guide is not shown persistently during normal play, but can be reopened on demand and closed again", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    expect(screen.queryByTestId("nlc-play-guide")).not.toBeInTheDocument();

    await user.click(await screen.findByTestId("nlc-guide-reopen"));
    expect(await screen.findByTestId("nlc-play-guide")).toBeInTheDocument();
    await user.click(await screen.findByTestId("nlc-guide-continue"));
    expect(screen.queryByTestId("nlc-play-guide")).not.toBeInTheDocument();
    // Reopening and closing the guide must not have reset anything -- still on the same beat.
    expect(await screen.findByTestId("nlc-location-scene")).toBeInTheDocument();
  });
});

describe("NEW LIFE CORE: Kamiya's intake form is a real UI action, not something free text can fake (directive Section 1/4/5/6/7/8)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("Kamiya's opening line asks for the form, and the form actually appears on screen", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    expect(screen.getByTestId(`nlc-npc-card-kamiya`).textContent).toMatch(/ご記入/);
    await user.click(await screen.findByTestId("nlc-action-fill_intake_form"));
    expect(await screen.findByTestId("nlc-intake-form")).toBeInTheDocument();
  });

  it("the form cannot be submitted without choosing an employment status, but every free-text field may stay blank", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-action-fill_intake_form"));
    const submit = await screen.findByTestId("nlc-intake-submit");
    expect(submit).toBeDisabled();
    await user.click(screen.getByTestId("nlc-intake-employment-not_working"));
    expect(submit).toBeEnabled();
    // name / reason / thoughts / troubles are all left blank here on purpose.
    await user.click(submit);
    expect(screen.queryByTestId("nlc-intake-form")).not.toBeInTheDocument();
  });

  it("submitted form content reaches Kamiya's own AI context as a fact he knows, verbatim -- not a career/personality diagnosis", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-action-fill_intake_form"));
    await user.click(screen.getByTestId("nlc-intake-employment-not_working"));
    await user.type(screen.getByTestId("nlc-intake-thoughts"), "まだ何がしたいか分からない");
    await user.click(screen.getByTestId("nlc-intake-submit"));

    // The scripted reaction shows without reciting the whole form back.
    const result = await screen.findByTestId("nlc-special-result");
    expect(result.textContent).toMatch(/目を通した/);
    expect(result.textContent).not.toMatch(/まだ何がしたいか分からない/);

    // But the fact itself reached Kamiya's knowledge, quoted, not classified.
    const { buildNpcAiContext } = await import("../src/newlifecore/dialogue/contextBuilder");
    const { createInitialCoreState } = await import("../src/newlifecore/types");
    const s = createInitialCoreState();
    const withForm = {
      ...s,
      intakeForm: { name: "", employmentStatus: "not_working" as const, cameHereReason: "", currentThoughts: "まだ何がしたいか分からない", troubles: "" },
      worldFacts: [{ id: "intake_current_thoughts", time: s.time, text: "PLAYERは「今のところ考えていること」に「まだ何がしたいか分からない」と書いた。", knownBy: ["kamiya" as const] }],
    };
    const ctx = buildNpcAiContext("kamiya", withForm, "こんにちは");
    expect(ctx.knownFacts.join(" ")).toMatch(/まだ何がしたいか分からない/);
    expect(ctx.knownFacts.join(" ")).not.toMatch(/lazy|fears employment|怠け|やる気がない/);
  });

  it("world/action consistency: once submitted, the form action is not offered again (it was a one-time real event, not a repeatable free-text claim)", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    expect(screen.getByTestId("nlc-action-fill_intake_form")).toBeInTheDocument();
    await user.click(screen.getByTestId("nlc-action-fill_intake_form"));
    await user.click(screen.getByTestId("nlc-intake-employment-other"));
    await user.click(screen.getByTestId("nlc-intake-submit"));
    expect(screen.queryByTestId("nlc-action-fill_intake_form")).not.toBeInTheDocument();
    expect(screen.getByTestId("nlc-action-view_jobs")).toBeInTheDocument();
  });

  it("free conversation with Kamiya still works independently of the form (a player may ignore the form entirely)", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    const input = await screen.findByTestId("nlc-freetext-input-kamiya");
    await user.type(input, "用紙は後でいいですか");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    const log = await screen.findByTestId("nlc-conversation-log-kamiya");
    expect(log.textContent).toMatch(/用紙は後でいいですか/);
  });
});

describe("NEW LIFE CORE: approved art actually renders", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("Challenge Town image is visible on the opening screen", async () => {
    window.history.pushState({}, "", "/?newlifecore=1");
    render(<App />);
    const img = await screen.findByTestId("nlc-town-image");
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toContain("challenge-town");
  });

  it("Yohei's portrait renders when visiting his store", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-move-YOHEI_STORE"));
    const img = await screen.findByTestId("nlc-portrait-yohei");
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("src")).toContain("yohei");
  });
});

describe("NEW LIFE CORE: a day does not end after one action, and the clock is always visible", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("after leaving the trial house once, the day continues (no day-end screen) and the clock has advanced", async () => {
    const user = userEvent.setup();
    await start(user);
    expect(screen.getByTestId("nlc-clock").textContent).toMatch(/08:45/);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    expect(screen.queryByTestId("nlc-day-end")).not.toBeInTheDocument();
    expect(screen.getByTestId("nlc-clock").textContent).not.toMatch(/08:45/);
  });

  it("ignoring Kamiya entirely and walking straight back to the trial house does not softlock the game", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-move-TRIAL_HOUSE"));
    // Should show the normal movelist again, not the forced "go to Challenge Center" wake scene.
    expect(await screen.findByTestId("nlc-movelist")).toBeInTheDocument();
    expect(screen.queryByTestId("nlc-wake-scene")).not.toBeInTheDocument();
  });
});

describe("NEW LIFE CORE: free-text conversation actually works", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("submitting free text to Kamiya produces a visible reply and the input clears", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    const input = await screen.findByTestId("nlc-freetext-input-kamiya");
    await user.type(input, "本当は何がしたいのか、まだ分かりません");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    const log = await screen.findByTestId("nlc-conversation-log-kamiya");
    expect(log.textContent).toMatch(/本当は何がしたいのか、まだ分かりません/);
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("multiple exchanges with the same NPC are possible without leaving the conversation", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "一つ目の発言です");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    await screen.findByText("一つ目の発言です");
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "二つ目の発言です");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    const log = await screen.findByTestId("nlc-conversation-log-kamiya");
    expect(log.textContent).toMatch(/一つ目の発言です/);
    expect(log.textContent).toMatch(/二つ目の発言です/);
  });
});

describe("NEW LIFE CORE: no raw technical state ever appears on screen", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("no internal field/type names leak into the rendered DOM across a short playthrough", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "こんにちは");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    await screen.findByText("こんにちは");
    expect(document.body.textContent).not.toMatch(/CoreState|WorldFact|npcMemory|ConversationTurn|visibleUtterance|NpcAiContext/);
  });
});

describe("NEW LIFE CORE: Owner play does not require finding a dev-only toggle (directive NEW_LIFE_DAY1_OWNER_REVIEW_READY_V1 Section 4)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("the live-AI default is keyed off an actual `vite` dev server (MODE), not DEV -- DEV is also true under this very test run, so a regression back to DEV alone would make every rendered-UI test fetch a nonexistent endpoint", async () => {
    // This test's own successful, fast completion is direct evidence the default stayed off here
    // (MODE is "test", not "development") -- if it flipped on, free-text submission below would
    // attempt a real fetch to /api/newlifecore-npc-dialogue and only resolve after that fetch
    // rejects, rather than immediately via the deterministic adapter.
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    const toggle = screen.getByTestId("nlc-live-toggle") as HTMLInputElement;
    expect(toggle.checked).toBe(false);
  });
});

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: real purchase flow (Section 8/9/10/26)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("buying rice at Yohei's store deducts money, adds inventory, and shows a short receive narration -- never a raw JSON dump", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-move-YOHEI_STORE"));
    await user.click(await screen.findByTestId("nlc-action-shop_here"));
    expect(await screen.findByTestId("nlc-shopping-picker")).toBeInTheDocument();

    await user.click(screen.getByTestId("nlc-shop-item-rice"));
    expect(screen.getByTestId("nlc-shop-total").textContent).toMatch(/1200円/);
    await user.click(screen.getByTestId("nlc-shop-confirm"));

    expect(screen.queryByTestId("nlc-shopping-picker")).not.toBeInTheDocument();
    const result = await screen.findByTestId("nlc-special-result");
    expect(result.textContent).toMatch(/米/);
    expect(result.textContent).not.toMatch(/[{}[\]]/);

    // The purchase is real, structural state -- visible back at the trial house via a plain
    // living action, not a debug field.
    await user.click(await screen.findByTestId("nlc-move-TRIAL_HOUSE"));
    await user.click(await screen.findByTestId("nlc-action-check_belongings"));
    expect((await screen.findByTestId("nlc-special-result")).textContent).toMatch(/米/);
  });

  it("cancelling the shopping picker changes nothing", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-move-YOHEI_STORE"));
    await user.click(await screen.findByTestId("nlc-action-shop_here"));
    await user.click(await screen.findByTestId("nlc-shop-cancel"));
    expect(screen.queryByTestId("nlc-shopping-picker")).not.toBeInTheDocument();
    await user.click(await screen.findByTestId("nlc-move-TRIAL_HOUSE"));
    await user.click(await screen.findByTestId("nlc-action-check_belongings"));
    expect((await screen.findByTestId("nlc-special-result")).textContent).toMatch(/持ち帰った物はまだない/);
  });

  it("ordering at the cafe is a real, separate action from just sitting down", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-move-CAFE_NODOKA"));
    expect(await screen.findByTestId("nlc-action-order_menu")).toBeInTheDocument();
    expect(screen.getByTestId("nlc-action-sit_down")).toBeInTheDocument();
    await user.click(screen.getByTestId("nlc-action-order_menu"));
    await user.click(await screen.findByTestId("nlc-shop-item-toast"));
    await user.click(screen.getByTestId("nlc-shop-confirm"));
    expect((await screen.findByTestId("nlc-special-result")).textContent).toMatch(/トースト/);
  });
});

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: trial house has real, varied living actions (Section 12/13)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("returning to the trial house after venturing out shows more than one real action, not just leaving", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-move-TRIAL_HOUSE"));
    const scene = await screen.findByTestId("nlc-location-scene");
    expect(within(scene).getByTestId("nlc-action-check_belongings")).toBeInTheDocument();
    expect(within(scene).getByTestId("nlc-action-rest_a_while")).toBeInTheDocument();
  });
});

describe("NEW_LIFE_DAY1_LIVING_DEPTH_AND_DIALOGUE_PRECISION_V1: a conversation survives the NPC leaving mid-conversation (own root-cause fix -- Owner playtest evidence gathering found this exact bug live)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("Jin's schedule takes him off BUSY/AWAY while the player is still mid-conversation with him -- the just-arrived reply must not vanish, and the move list must become reachable again after closing", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center")); // DAY_START_MINUTES 8:45 -> moveTo +15 = 9:00
    await user.click(await screen.findByTestId("nlc-move-COMMUNITY_HALL")); // +15 = 9:15, jin AVAILABLE (8:00-9:30)
    await user.click(await screen.findByTestId("nlc-talk-jin"));

    await user.type(await screen.findByTestId("nlc-freetext-input-jin"), "こんにちは");
    await user.click(await screen.findByTestId("nlc-freetext-submit-jin")); // +10 = 9:25, still AVAILABLE
    await screen.findByText("こんにちは");

    // This second turn crosses 9:30 -- jin's schedule enters a BUSY block, and day1.ts's
    // COMMUNITY_HALL scene explicitly returns npcsHere: [] while BUSY (see content/day1.ts).
    await user.type(await screen.findByTestId("nlc-freetext-input-jin"), "器用なんですね");
    await user.click(await screen.findByTestId("nlc-freetext-submit-jin")); // +10 = 9:35, now BUSY
    await screen.findByText("器用なんですね");

    // The reply must still be visible -- not lost just because jin's card would otherwise vanish.
    const log = await screen.findByTestId("nlc-conversation-log-jin");
    expect(log.textContent).toMatch(/器用なんですね/);
    // Further free-text input no longer makes sense once the npc has left -- it must not still be offered.
    expect(screen.queryByTestId("nlc-freetext-input-jin")).not.toBeInTheDocument();
    expect(await screen.findByTestId("nlc-npc-departed-jin")).toBeInTheDocument();

    // Closing must actually return the player to a playable state -- the move list must reappear
    // (previously it stayed hidden forever: gated on !activeConversation, which nothing ever cleared).
    await user.click(await screen.findByTestId("nlc-conversation-close-jin"));
    expect(await screen.findByTestId("nlc-movelist")).toBeInTheDocument();
    expect(screen.queryByTestId("nlc-npc-card-jin")).not.toBeInTheDocument();
  });
});

async function goToFortuneHouse(user: U) {
  // Shizuko's schedule opens at 10:00 -- burn enough travel time to land exactly on opening.
  await user.click(await screen.findByTestId("nlc-go-challenge-center")); // 8:45 -> 9:00
  await user.click(await screen.findByTestId("nlc-move-YOHEI_STORE")); // -> 9:15
  await user.click(await screen.findByTestId("nlc-move-CAFE_NODOKA")); // -> 9:30
  await user.click(await screen.findByTestId("nlc-move-COMMUNITY_HALL")); // -> 9:45
  await user.click(await screen.findByTestId("nlc-move-FORTUNE_HOUSE")); // -> 10:00, exactly opening
}

describe("PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1: the Thinking Resident coexists with the rest of the town (Section F, M scenario 8)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("Shizuko is present at FORTUNE_HOUSE with both free conversation and the fortune-telling special action (PHASE_15 -- Fortune House replaces the barbershop, no shop mechanic)", async () => {
    const user = userEvent.setup();
    await start(user);
    await goToFortuneHouse(user);
    expect(await screen.findByTestId("nlc-npc-card-shizuko")).toBeInTheDocument();
    expect(screen.getByTestId("nlc-talk-shizuko")).toBeInTheDocument();
    expect(screen.getByTestId("nlc-action-start_fortune_telling")).toBeInTheDocument();
  });
});

describe("PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1: Reality Bridge loop, real UI end to end (Section H, M scenario 3/4/5)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("a real-life-concern-shaped message offers the bridge; declining leaves no trace, accepting requires the player's own words and creates a real record", async () => {
    const user = userEvent.setup();
    await start(user);
    await goToFortuneHouse(user);
    await user.click(await screen.findByTestId("nlc-talk-shizuko"));
    await user.type(await screen.findByTestId("nlc-freetext-input-shizuko"), "最近、仕事を先延ばしにしています");
    await user.click(await screen.findByTestId("nlc-freetext-submit-shizuko"));

    expect(await screen.findByTestId("nlc-reality-bridge-offer")).toBeInTheDocument();
    // Declining removes the offer without creating anything.
    await user.click(screen.getByTestId("nlc-bridge-offer-dismiss"));
    expect(screen.queryByTestId("nlc-reality-bridge-offer")).not.toBeInTheDocument();

    // Ask again and this time accept -- creation requires the player's OWN typed words; the confirm
    // button must stay disabled until something is actually written (never auto-created from the offer alone).
    await user.type(screen.getByTestId("nlc-freetext-input-shizuko"), "やっぱり気になります");
    await user.click(screen.getByTestId("nlc-freetext-submit-shizuko"));
    // "気になります" alone doesn't match the concern heuristic, so re-trigger with concern language again.
    await user.type(screen.getByTestId("nlc-freetext-input-shizuko"), "先延ばしにしているのを何とかしたい");
    await user.click(screen.getByTestId("nlc-freetext-submit-shizuko"));
    await user.click(await screen.findByTestId("nlc-bridge-offer-accept"));
    const confirm = screen.getByTestId("nlc-bridge-intent-confirm");
    expect(confirm).toBeDisabled();
    await user.type(screen.getByTestId("nlc-bridge-intent-input"), "明日、1件だけ手をつけてみる");
    expect(confirm).toBeEnabled();
    await user.click(confirm);

    expect(screen.queryByTestId("nlc-reality-bridge-compose")).not.toBeInTheDocument();
    const result = await screen.findByTestId("nlc-special-result");
    expect(result.textContent).not.toMatch(/lazy|procrastinat|怠け/);
  });

  it("the check-in offer appears the day after an intent was created, and answering it produces a plain, non-scored record", async () => {
    const user = userEvent.setup();
    await start(user);
    await goToFortuneHouse(user);
    await user.click(await screen.findByTestId("nlc-talk-shizuko"));
    await user.type(await screen.findByTestId("nlc-freetext-input-shizuko"), "運動が続かないのが悩みです");
    await user.click(await screen.findByTestId("nlc-freetext-submit-shizuko"));
    await user.click(await screen.findByTestId("nlc-bridge-offer-accept"));
    await user.type(screen.getByTestId("nlc-bridge-intent-input"), "今週、1回だけ歩く");
    await user.click(screen.getByTestId("nlc-bridge-intent-confirm"));
    await user.click(screen.getByTestId("nlc-conversation-close-shizuko"));

    // No check-in offer on the SAME day.
    expect(screen.queryByTestId("nlc-action-check_in_intent")).not.toBeInTheDocument();

    // Fast-forward to a sleepable time, end the day, and advance to day 2.
    let guard = 0;
    while (!(await screen.queryByTestId("nlc-sleep")) && guard < 60) {
      await user.click(screen.getByTestId(`nlc-move-${guard % 2 === 0 ? "YOHEI_STORE" : "CAFE_NODOKA"}`));
      guard++;
    }
    await user.click(await screen.findByTestId("nlc-sleep"));
    await user.click(await screen.findByTestId("nlc-next-day"));
    expect(screen.getByTestId("nlc-clock").textContent).toMatch(/DAY2/);

    await goToFortuneHouse(user);
    expect(await screen.findByTestId("nlc-action-check_in_intent")).toBeInTheDocument();
    await user.click(screen.getByTestId("nlc-action-check_in_intent"));
    expect(await screen.findByTestId("nlc-reality-bridge-checkin")).toBeInTheDocument();
    expect(screen.getByTestId("nlc-checkin-submit")).toBeDisabled();
    await user.click(screen.getByTestId("nlc-checkin-response-partially"));
    await user.click(screen.getByTestId("nlc-checkin-submit"));

    expect(screen.queryByTestId("nlc-reality-bridge-checkin")).not.toBeInTheDocument();
    // Checked in -- the action must not be offered a second time.
    expect(screen.queryByTestId("nlc-action-check_in_intent")).not.toBeInTheDocument();
    const result = await screen.findByTestId("nlc-special-result");
    expect(result.textContent).not.toMatch(/成功|失敗|success|failure/);
  }, 30000);
});

describe("PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1: safety route (Section J)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("a crisis-shaped message never reaches an NPC reply -- the fixed safety message shows instead, and nothing is recorded in conversation memory", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "もう死にたいです");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));

    expect(await screen.findByTestId("nlc-safety-route")).toBeInTheDocument();
    expect(screen.getByTestId("nlc-safety-route").textContent).toMatch(/119番/);
    // The normal input row must be gone -- this is not just another AI turn.
    expect(screen.queryByTestId("nlc-freetext-input-kamiya")).not.toBeInTheDocument();
    const log = screen.getByTestId("nlc-conversation-log-kamiya");
    expect(log.textContent).not.toMatch(/死にたい/);
  });

  it("closing the conversation after a safety-route trigger and reopening it behaves normally again", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "消えてしまいたいと思うことがあります");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    await screen.findByTestId("nlc-safety-route");
    await user.click(screen.getByTestId("nlc-conversation-close-kamiya"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    expect(screen.queryByTestId("nlc-safety-route")).not.toBeInTheDocument();
    expect(await screen.findByTestId("nlc-freetext-input-kamiya")).toBeInTheDocument();
  });

  it("PHASE_12_4 Section E: the safety route always wins over the Reality Bridge offer, even to Shizuko, even when the text also matches the concern heuristic -- there is no path from a crisis input to a bridge offer", async () => {
    const user = userEvent.setup();
    await start(user);
    await goToFortuneHouse(user);
    await user.click(await screen.findByTestId("nlc-talk-shizuko"));
    // Matches BOTH detectsCrisisSignal ("死にたい") AND looksLikeRealLifeConcern ("先延ばし").
    await user.type(await screen.findByTestId("nlc-freetext-input-shizuko"), "仕事を先延ばしにしてるし、もう死にたい");
    await user.click(await screen.findByTestId("nlc-freetext-submit-shizuko"));

    expect(await screen.findByTestId("nlc-safety-route")).toBeInTheDocument();
    expect(screen.queryByTestId("nlc-reality-bridge-offer")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nlc-reality-bridge-compose")).not.toBeInTheDocument();
  });
});

describe("PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1: conversation UI no longer dumps the full backlog by default (Section E)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("only the last few of today's exchanges render by default; older ones collapse behind an expand action", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    for (let i = 0; i < 6; i++) {
      await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), `発言${i}`);
      await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
      await screen.findByText(`発言${i}`);
    }
    // 6 turns sent, only the most recent 4 should render without expanding.
    expect(screen.queryByText("発言0")).not.toBeInTheDocument();
    expect(screen.queryByText("発言1")).not.toBeInTheDocument();
    expect(screen.getByText("発言5")).toBeInTheDocument();
    expect(await screen.findByTestId("nlc-expand-today-kamiya")).toBeInTheDocument();
    await user.click(screen.getByTestId("nlc-expand-today-kamiya"));
    expect(screen.getByText("発言0")).toBeInTheDocument();
  });

  it("reopening a conversation on a later day shows a short one-line summary of the earlier day, not the full transcript, until expanded", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "初日の発言です");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    await screen.findByText("初日の発言です");
    await user.click(screen.getByTestId("nlc-conversation-close-kamiya"));

    let guard = 0;
    while (!(await screen.queryByTestId("nlc-sleep")) && guard < 60) {
      await user.click(screen.getByTestId(`nlc-move-${guard % 2 === 0 ? "YOHEI_STORE" : "CAFE_NODOKA"}`));
      guard++;
    }
    await user.click(await screen.findByTestId("nlc-sleep"));
    await user.click(await screen.findByTestId("nlc-next-day"));
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));

    expect(await screen.findByTestId("nlc-past-summary-kamiya")).toBeInTheDocument();
    expect(screen.queryByText("初日の発言です")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("nlc-expand-past-kamiya"));
    expect(screen.getByText("初日の発言です")).toBeInTheDocument();
  }, 30000);
});

describe("PHASE_12_3_NEW_LIFE_WORLD_AND_THINKING_RESIDENT_V1: research opt-in is off by default and separate from gameplay (Section I)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("the opt-in checkbox defaults unchecked, and free conversation works identically whether toggled or not", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/?newlifecore=1");
    render(<App />);
    await user.click(await screen.findByTestId("nlc-start"));
    const checkbox = screen.getByTestId("nlc-research-optin") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
    await user.click(await screen.findByTestId("nlc-guide-continue"));
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "こんにちは");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    expect(await screen.findByTestId("nlc-conversation-log-kamiya")).toHaveTextContent("こんにちは");
  });
});

describe("mobile -- no horizontal overflow", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("opening and the first free-roam screen fit without horizontal scroll at 360/390/430px", async () => {
    for (const width of [360, 390, 430]) {
      const originalWidth = window.innerWidth;
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
      const user = userEvent.setup();
      await start(user);
      expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
      await user.click(await screen.findByTestId("nlc-go-challenge-center"));
      expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: originalWidth });
      cleanup();
    }
  });
});

describe("PHASE_12_6_NEW_LIFE_RELATIONSHIP_CONSEQUENCE_AND_SOCIAL_MEMORY_V1: promise offer, real UI end to end (Section 6/7)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("talking to a non-Shizuko NPC offers a real, structural accept/decline choice -- never inferred from free text alone", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "こんにちは");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    expect(await screen.findByTestId("nlc-promise-offer")).toBeInTheDocument();
    expect(screen.getByTestId("nlc-promise-accept-kamiya")).toBeInTheDocument();
    expect(screen.getByTestId("nlc-promise-decline-kamiya")).toBeInTheDocument();
  });

  it("accepting closes the offer and does not immediately offer a second one to the same NPC (no promise spam while one is pending)", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "こんにちは");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    await user.click(await screen.findByTestId("nlc-promise-accept-kamiya"));
    expect(screen.queryByTestId("nlc-promise-offer")).not.toBeInTheDocument();

    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "また今度");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    expect(screen.queryByTestId("nlc-promise-offer")).not.toBeInTheDocument();
  });

  it("declining is a first-class, equally-weighted choice -- closes the offer with no failure/negative result text, and the conversation continues normally", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "こんにちは");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    await user.click(await screen.findByTestId("nlc-promise-decline-kamiya"));
    expect(screen.queryByTestId("nlc-promise-offer")).not.toBeInTheDocument();
    expect(screen.queryByTestId("nlc-special-result")).not.toBeInTheDocument();

    // The conversation itself still works normally afterward -- declining an invitation is not a
    // dead end or a degraded mode.
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "また今度");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    const log = await screen.findByTestId("nlc-conversation-log-kamiya");
    expect(log.textContent).toMatch(/また今度/);
  });

  it("Shizuko is never offered a promise -- Reality Bridge stays the only mechanism for her (Section 15)", async () => {
    const user = userEvent.setup();
    await start(user);
    // Warm up past 10:00 -- FORTUNE_HOUSE doesn't open until then.
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    for (const loc of ["YOHEI_STORE", "CAFE_NODOKA", "COMMUNITY_HALL"]) {
      await user.click(await screen.findByTestId(`nlc-move-${loc}`));
    }
    await user.click(await screen.findByTestId("nlc-move-FORTUNE_HOUSE"));
    await user.click(await screen.findByTestId("nlc-talk-shizuko"));
    await user.type(await screen.findByTestId("nlc-freetext-input-shizuko"), "こんにちは");
    await user.click(await screen.findByTestId("nlc-freetext-submit-shizuko"));
    expect(screen.queryByTestId("nlc-promise-offer")).not.toBeInTheDocument();
  });

  it("no social-memory UI ever appears -- no promise list, no relationship value, no NPC history dashboard (Section 23)", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    await user.click(await screen.findByTestId("nlc-talk-kamiya"));
    await user.type(await screen.findByTestId("nlc-freetext-input-kamiya"), "こんにちは");
    await user.click(await screen.findByTestId("nlc-freetext-submit-kamiya"));
    await user.click(await screen.findByTestId("nlc-promise-accept-kamiya"));
    expect(document.body.textContent).not.toMatch(/pending|missed|shared_history|familiar|slightly_awkward/);
    expect(screen.queryByTestId(/promise-list|relationship-value|npc-history/)).not.toBeInTheDocument();
  });
});

async function sleepAndAdvance(user: U) {
  const wake = screen.queryByTestId("nlc-go-challenge-center");
  if (wake) await user.click(wake);
  let guard = 0;
  while (!(await screen.queryByTestId("nlc-sleep")) && guard < 60) {
    await user.click(screen.getByTestId(`nlc-move-${guard % 2 === 0 ? "YOHEI_STORE" : "CAFE_NODOKA"}`));
    guard++;
  }
  await user.click(await screen.findByTestId("nlc-sleep"));
  await user.click(await screen.findByTestId("nlc-next-day"));
}

async function goToCommunityHall(user: U) {
  const wake = screen.queryByTestId("nlc-go-challenge-center");
  if (wake) {
    await user.click(wake);
    await user.click(await screen.findByTestId("nlc-move-COMMUNITY_HALL"));
  } else {
    await user.click(await screen.findByTestId("nlc-move-COMMUNITY_HALL"));
  }
}

describe("PHASE_12_7_NEW_LIFE_PLAYER_TRAJECTORY_V1: life opportunity, real UI end to end (Section 6/7/29/31)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("Jin seed: no engage action on Day1 (minDayForHelp=2); appears from Day2; opportunity surfaces only after 2 engagements, and accepting relabels the action (Section 6 -- experience before label)", async () => {
    const user = userEvent.setup();
    await start(user);
    await goToCommunityHall(user);
    expect(screen.queryByTestId("nlc-action-engage_jin_odd_job")).not.toBeInTheDocument();

    await sleepAndAdvance(user); // -> Day2
    await goToCommunityHall(user);
    expect(await screen.findByTestId("nlc-action-engage_jin_odd_job")).toBeInTheDocument();
    expect(screen.queryByTestId("nlc-action-consider_jin_odd_job")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("nlc-action-engage_jin_odd_job"));
    expect((await screen.findByTestId("nlc-special-result")).textContent).toMatch(/修理/);

    await sleepAndAdvance(user);
    await sleepAndAdvance(user); // -> Day4 (engageCooldownDays=2)
    await goToCommunityHall(user);
    await user.click(screen.getByTestId("nlc-action-engage_jin_odd_job"));

    // Second engagement reached the threshold -- the "consider" action should now be offered.
    expect(await screen.findByTestId("nlc-action-consider_jin_odd_job")).toBeInTheDocument();
    await user.click(screen.getByTestId("nlc-action-consider_jin_odd_job"));
    expect(await screen.findByTestId("nlc-opportunity-offer")).toBeInTheDocument();
    await user.click(screen.getByTestId("nlc-opportunity-accept-jin"));
    expect(screen.queryByTestId("nlc-opportunity-offer")).not.toBeInTheDocument();

    // Once accepted, the SAME action id now shows the "work" framing, not "help" framing.
    await sleepAndAdvance(user);
    await sleepAndAdvance(user);
    await goToCommunityHall(user);
    const workButton = await screen.findByTestId("nlc-action-engage_jin_odd_job");
    expect(workButton.textContent).toMatch(/仕事をする/);
    expect(workButton.textContent).not.toMatch(/手伝いに行く/);
  }, 30000);

  it("declining an opportunity produces no failure/negative framing, and the ordinary engage action remains available afterward (Section 7/8)", async () => {
    const user = userEvent.setup();
    await start(user);
    await goToCommunityHall(user); // day1, no-op for jin (minDay 2)
    await sleepAndAdvance(user);
    await goToCommunityHall(user);
    await user.click(screen.getByTestId("nlc-action-engage_jin_odd_job"));
    await sleepAndAdvance(user);
    await sleepAndAdvance(user);
    await goToCommunityHall(user);
    await user.click(screen.getByTestId("nlc-action-engage_jin_odd_job"));
    await user.click(await screen.findByTestId("nlc-action-consider_jin_odd_job"));
    await user.click(await screen.findByTestId("nlc-opportunity-decline-jin"));

    const result = await screen.findByTestId("nlc-special-result");
    expect(result.textContent).not.toMatch(/失敗|ゲームオーバー|FAIL/);
    // The ordinary engage action is still there -- declining did not remove the ability to keep
    // helping informally (Section 7: declining is a valid life, not a dead end).
    await sleepAndAdvance(user);
    await sleepAndAdvance(user);
    await goToCommunityHall(user);
    expect(await screen.findByTestId("nlc-action-engage_jin_odd_job")).toBeInTheDocument();
  }, 30000);

  it("change of mind (Section 29): once accepted, a step-back action is offered, and stepping back does not block re-accepting later", async () => {
    const user = userEvent.setup();
    await start(user);
    await goToCommunityHall(user);
    await sleepAndAdvance(user);
    await goToCommunityHall(user);
    await user.click(screen.getByTestId("nlc-action-engage_jin_odd_job"));
    await sleepAndAdvance(user);
    await sleepAndAdvance(user);
    await goToCommunityHall(user);
    await user.click(screen.getByTestId("nlc-action-engage_jin_odd_job"));
    await user.click(await screen.findByTestId("nlc-action-consider_jin_odd_job"));
    await user.click(await screen.findByTestId("nlc-opportunity-accept-jin"));

    await sleepAndAdvance(user);
    await goToCommunityHall(user);
    expect(await screen.findByTestId("nlc-action-stepback_jin_odd_job")).toBeInTheDocument();
    await user.click(screen.getByTestId("nlc-action-stepback_jin_odd_job"));
    const result = await screen.findByTestId("nlc-special-result");
    expect(result.textContent).not.toMatch(/失敗|クビ|解雇/);

    // No lock-in: after stepping back, the ordinary engage action (not "work") is offered again.
    await sleepAndAdvance(user);
    await goToCommunityHall(user);
    const button = await screen.findByTestId("nlc-action-engage_jin_odd_job");
    expect(button.textContent).toMatch(/手伝いに行く/);
  }, 30000);

  it("no life-route/career UI ever appears anywhere -- no job board, no route selector, no XP display (Section 31/33)", async () => {
    const user = userEvent.setup();
    await start(user);
    await goToCommunityHall(user);
    await sleepAndAdvance(user);
    await goToCommunityHall(user);
    await user.click(screen.getByTestId("nlc-action-engage_jin_odd_job"));
    expect(document.body.textContent).not.toMatch(/経験値|XP|レベル|職業選択|人生ルート/);
    expect(screen.queryByTestId(/life-route|job-board|trajectory-list/)).not.toBeInTheDocument();
  }, 15000);
});

describe("PHASE_12_8_NEW_LIFE_30_DAY_ARC_AND_RETROSPECTIVE_V1: Day 30 retrospective, real UI end to end (Section 3/4/26)", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
    cleanup();
  });

  it("the retrospective screen does not appear on any earlier day's end screen (only Day 30's)", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    for (let day = 1; day < 10; day++) {
      const wake = screen.queryByTestId("nlc-go-challenge-center");
      if (wake) await user.click(wake);
      let guard = 0;
      while (!(await screen.queryByTestId("nlc-sleep")) && guard < 60) {
        await user.click(screen.getByTestId(`nlc-move-${guard % 2 === 0 ? "YOHEI_STORE" : "CAFE_NODOKA"}`));
        guard++;
      }
      await user.click(await screen.findByTestId("nlc-sleep"));
      expect(screen.queryByTestId("nlc-day30-retrospective")).not.toBeInTheDocument();
      await user.click(await screen.findByTestId("nlc-next-day"));
    }
  }, 60000);

  it("day 30's end screen shows the retrospective with real content, no score/dashboard, and an optional skippable reflection", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    for (let day = 1; day < 30; day++) {
      await sleepAndAdvance(user);
    }
    // Now on day 30 -- advance through the day to its own end screen without clicking next-day.
    const wake = screen.queryByTestId("nlc-go-challenge-center");
    if (wake) await user.click(wake);
    let guard = 0;
    while (!(await screen.queryByTestId("nlc-sleep")) && guard < 60) {
      await user.click(screen.getByTestId(`nlc-move-${guard % 2 === 0 ? "YOHEI_STORE" : "CAFE_NODOKA"}`));
      guard++;
    }
    await user.click(await screen.findByTestId("nlc-sleep"));

    const retro = await screen.findByTestId("nlc-day30-retrospective");
    expect(retro.textContent).toMatch(/30日目の夜になった/);
    expect(retro.textContent).not.toMatch(/経験値|XP|レベル|好感度|ランキング|%/);
    expect(screen.queryByTestId(/dashboard|stats-table|radar/)).not.toBeInTheDocument();

    // Reflection is optional -- skip it, and the day still ends normally.
    await user.click(screen.getByTestId("nlc-day30-reflection-skip"));
    expect(screen.queryByTestId("nlc-day30-reflection-prompt")).not.toBeInTheDocument();
    expect(await screen.findByTestId("nlc-next-day")).toBeInTheDocument();
  }, 90000);

  it("submitting a reflection stores it verbatim and marks it recorded, without analyzing or reacting to its content", async () => {
    const user = userEvent.setup();
    await start(user);
    await user.click(await screen.findByTestId("nlc-go-challenge-center"));
    for (let day = 1; day < 30; day++) {
      await sleepAndAdvance(user);
    }
    const wake = screen.queryByTestId("nlc-go-challenge-center");
    if (wake) await user.click(wake);
    let guard = 0;
    while (!(await screen.queryByTestId("nlc-sleep")) && guard < 60) {
      await user.click(screen.getByTestId(`nlc-move-${guard % 2 === 0 ? "YOHEI_STORE" : "CAFE_NODOKA"}`));
      guard++;
    }
    await user.click(await screen.findByTestId("nlc-sleep"));
    await screen.findByTestId("nlc-day30-retrospective");

    await user.type(screen.getByTestId("nlc-day30-reflection-input"), "思ったより、人と話す30日だった");
    await user.click(screen.getByTestId("nlc-day30-reflection-submit"));
    expect(await screen.findByTestId("nlc-day30-reflection-recorded")).toBeInTheDocument();
    expect(screen.queryByTestId("nlc-day30-reflection-prompt")).not.toBeInTheDocument();
    // The player's own words are never echoed back with any AI-generated commentary around them --
    // the recorded marker is a fixed, neutral line, not a reaction to what was written.
    expect(screen.getByTestId("nlc-day30-reflection-recorded").textContent).toBe("（自分の言葉を書き残した。）");
  }, 90000);
});
