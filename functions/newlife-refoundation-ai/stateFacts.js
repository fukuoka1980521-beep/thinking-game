function canonicalStateFactsForCase(caseId, dynamicState) {
  if (caseId !== "NEWLIFE_30DAY_V1") return [];
  const state =
    dynamicState && dynamicState.canonicalState && typeof dynamicState.canonicalState === "object"
      ? dynamicState.canonicalState
      : {};
  const facts = [];

  if (state.mSeats === "bounded") facts.push("美代子の喫茶席の利用範囲は本人の言葉で確認済み。");
  if (state.mSeats === "assumed") facts.push("美代子の喫茶席の利用範囲はまだ明示確認されていない。");

  if (state.pickupPlan === "time_split_owned_by_hina") facts.push("予約品の受け渡し時間は陽菜本人が分ける方針を決めている。");
  if (state.pickupPlan === "unassigned") facts.push("予約品の受け渡し担当・時間分担はまだ確定していない。");

  if (state.jWork === "extra_with_specific_consent") facts.push("仁の追加作業は内容と時間を具体化して本人同意済み。");
  if (state.jWork === "extra_declined") facts.push("仁は追加作業を引き受けない判断をしている。");
  if (state.jWork === "agreed_two_hours") facts.push("仁について確定しているのは最初の有償二時間だけで、追加作業は未合意。");

  if (state.dWorkshop === "one_hour_yes") facts.push("大輔は工房を一時間使うことに本人同意済み。");
  if (state.dWorkshop === "no") facts.push("大輔は工房利用を断っている。");
  if (state.dWorkshop === "lapsed") facts.push("大輔の工房利用は期限までに返事がなく利用前提にできない。");
  if (state.dWorkshop === "pending") facts.push("大輔の工房利用はまだ本人の返事待ち。");

  if (state.fEditor === "named") facts.push("掲示の最終確認担当は確定済み。");
  if (state.fEditor === "unassigned") facts.push("掲示の最終確認担当はまだ確定していない。");

  if (state.hyFactCheck === "direct") facts.push("陽菜と洋平は数字と説明内容を本人同士で直接照合済み。");
  if (state.hyFactCheck === "avoided") facts.push("陽菜と洋平の直接照合はまだ成立していない。");

  if (state.signVersion === "clear_from_start") facts.push("試売掲示は最初から予約分と店頭分の内訳が明確だった。");
  if (state.signVersion === "vague_then_corrected") facts.push("試売掲示は一度曖昧に出た後、内訳が分かる形へ訂正された。");
  if (state.signVersion === "vague_uncorrected") facts.push("試売掲示は内訳が曖昧なまま訂正されていない。");

  return facts;
}

module.exports = { canonicalStateFactsForCase };
