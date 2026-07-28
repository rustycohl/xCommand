import {
  MAX_AP,
  openTurn,
  spendAction,
  validateCommanderCard,
} from "./lib/action-economy.mjs";

export async function runSelfTest() {
  const card = { id: "self-test", ap_modifier: -1 };
  validateCommanderCard(card);
  const spent = spendAction(openTurn(), 4, card);
  let absoluteRejected = false;
  try {
    validateCommanderCard({ ap_modifier: 0, max_ap: 24 });
  } catch {
    absoluteRejected = true;
  }
  return {
    pass: spent.turn.maximum === MAX_AP
      && spent.turn.remaining === 7
      && absoluteRejected,
    summary: "10 AP authority → card modifier → guarded spend",
    checks: [
      { name: "Maximum stays 10", pass: spent.turn.maximum === 10 },
      { name: "Modifier changes cost", pass: spent.quote.effective_cost === 3 },
      { name: "Absolute card AP rejected", pass: absoluteRejected },
    ],
    evidence: spent,
  };
}
