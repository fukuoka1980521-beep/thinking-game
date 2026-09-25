import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { markOnboardingSeen } from "../src/lib/onboarding";

// Route isolation: ?newlife-refoundation=1 must behave exactly like the
// existing ?newlife30=1 hidden-link pattern in App.tsx (tests/newlife30Route.test.tsx)
// -- opt-in only, never linked from HomeScreen, never the default route, and
// the normal app must render completely unaffected when the param is absent.
describe("NEW LIFE refoundation route isolation (V11 stage 7)", () => {
  it("the plain '/' route renders normal HomeScreen, with no refoundation reference anywhere on it", () => {
    markOnboardingSeen();
    window.history.pushState({}, "", "/");
    render(<App />);
    expect(screen.getByText("思考整理ゲーム")).toBeInTheDocument();
    expect(screen.queryByText(/空き稽古場/)).not.toBeInTheDocument();
  });

  it("?newlife-refoundation=1 opens the refoundation slice directly, bypassing HomeScreen entirely", () => {
    window.history.pushState({}, "", "/?newlife-refoundation=1");
    render(<App />);
    expect(screen.getByText(/空き稽古場の50分/)).toBeInTheDocument();
    expect(screen.queryByText("思考整理ゲーム")).not.toBeInTheDocument();
  });

  it("HUMAN_VALIDATION_STATUS is disclosed as PENDING on the purpose screen, never a hidden claim of PASS", () => {
    window.history.pushState({}, "", "/?newlife-refoundation=1");
    render(<App />);
    expect(screen.getByText(/HUMAN_VALIDATION_STATUS = PENDING/)).toBeInTheDocument();
  });

  it("does not reveal a correct answer or lesson on the purpose screen", () => {
    window.history.pushState({}, "", "/?newlife-refoundation=1");
    render(<App />);
    expect(screen.getByText(/正解や教訓は用意されていません/)).toBeInTheDocument();
  });
});

describe("NEW LIFE refoundation UI smoke test (V11 stage 7)", () => {
  async function openSlice() {
    window.history.pushState({}, "", "/?newlife-refoundation=1");
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "はじめる" }));
    return user;
  }

  it("shows the opening scene and both NPCs' opening lines after starting", async () => {
    await openSlice();
    expect(screen.getByText(/この場面、明日はやりません/)).toBeInTheDocument();
    expect(screen.getByText(/昨日まではやってただろ/)).toBeInTheDocument();
    expect(screen.getByText(/残り時間: 50 分/)).toBeInTheDocument();
  });

  it("does not show the Thought Board before any consequence has occurred", async () => {
    await openSlice();
    expect(screen.queryByText("思考ボード")).not.toBeInTheDocument();
  });

  it("spends time and reveals the Thought Board after a fact-finding action", async () => {
    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "美香に何が変わったのか尋ねる" }));
    expect(await screen.findByText(/残り時間: 46 分/)).toBeInTheDocument();
    expect(screen.getByText("思考ボード")).toBeInTheDocument();
  });

  it("the boundary-check thought tool spends only 1 minute and asks Mika directly", async () => {
    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "（道具）どこまでなら大丈夫か構造化して尋ねる" }));
    expect(await screen.findByText(/残り時間: 49 分/)).toBeInTheDocument();
  });

  it("requires an explicit NPC target before free text can be sent", async () => {
    const user = await openSlice();
    const input = screen.getByRole("textbox", { name: "自由入力" });
    const send = screen.getByRole("button", { name: "送る" });

    await user.type(input, "何が引っかかっている？");
    expect(send).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "美香に話す" }));
    expect(send).toBeEnabled();
  });

  it("routes free text to Mika when Mika is explicitly selected", async () => {
    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "美香に話す" }));
    await user.type(screen.getByRole("textbox", { name: "自由入力" }), "何が引っかかっている？");
    await user.click(screen.getByRole("button", { name: "送る" }));

    expect(await screen.findByText("何が引っかかっている？")).toBeInTheDocument();
    expect(await screen.findByText(/美香はこちらを見て、話す準備をしている/)).toBeInTheDocument();
  });

  it("routes free text to Ryo when Ryo is explicitly selected", async () => {
    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "亮に話す" }));
    await user.type(screen.getByRole("textbox", { name: "自由入力" }), "変えたら何が困る？");
    await user.click(screen.getByRole("button", { name: "送る" }));

    expect(await screen.findByText("変えたら何が困る？")).toBeInTheDocument();
    expect(await screen.findByText(/亮は客席からこちらに向き直る/)).toBeInTheDocument();
  });

  it("reaches a non-ranked ending after a resolution action, without surfacing raw ontology labels", async () => {
    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "その場面をカットして進める" }));
    expect(await screen.findByText("結果（優劣はありません）")).toBeInTheDocument();
    expect(screen.getByText(/予定どおり進行/)).toBeInTheDocument();
    expect(screen.queryByText(/CUT_SCENE/)).not.toBeInTheDocument();
    expect(screen.queryByText(/CROSS_WITHOUT_PERMISSION/)).not.toBeInTheDocument();
    expect(screen.queryByText(/WITHDRAWN/)).not.toBeInTheDocument();
  });

  it("stops offering action buttons once the case has ended", async () => {
    const user = await openSlice();
    await user.click(screen.getByRole("button", { name: "その場面をカットして進める" }));
    await screen.findByText("結果（優劣はありません）");
    expect(screen.queryByRole("button", { name: "代役を立てる" })).not.toBeInTheDocument();
  });
});
