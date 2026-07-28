export const MAX_AP = 10;

const ABSOLUTE_AP_FIELDS = Object.freeze([
  "ap",
  "action_points",
  "max_ap",
  "ap_pool",
]);

export function validateCommanderCard(card) {
  if (!card || typeof card !== "object") {
    throw new TypeError("A Commander card is required.");
  }
  for (const field of ABSOLUTE_AP_FIELDS) {
    if (Object.hasOwn(card, field)) {
      throw new TypeError(`Commander cards may not define absolute AP (${field}).`);
    }
  }
  if (!Number.isInteger(card.ap_modifier) || card.ap_modifier < -3 || card.ap_modifier > 3) {
    throw new RangeError("Card AP modifier must be an integer from -3 through 3.");
  }
  return true;
}
export function openTurn(turnNumber = 1) {
  if (!Number.isInteger(turnNumber) || turnNumber < 1) {
    throw new RangeError("Turn number must be a positive integer.");
  }
  return {
    schema: "gzg.xcommand.action-economy/0.1",
    turn: turnNumber,
    maximum: MAX_AP,
    remaining: MAX_AP,
    spent: 0,
  };
}

export function quoteAction(baseCost, card) {
  validateCommanderCard(card);
  if (!Number.isInteger(baseCost) || baseCost < 1 || baseCost > MAX_AP) {
    throw new RangeError("Base action cost must be an integer from 1 through 10.");
  }

  return {
    base_cost: baseCost,
    card_modifier: card.ap_modifier,
    effective_cost: Math.min(MAX_AP, Math.max(1, baseCost + card.ap_modifier)),
  };
}

export function spendAction(turn, baseCost, card) {
  if (
    !turn
    || turn.maximum !== MAX_AP
    || !Number.isInteger(turn.remaining)
    || !Number.isInteger(turn.spent)
  ) {
    throw new TypeError("A valid Base-10 turn is required.");
  }

  const quote = quoteAction(baseCost, card);
  if (quote.effective_cost > turn.remaining) {
    throw new RangeError(
      `Action costs ${quote.effective_cost} AP; ${turn.remaining} AP remain.`,
    );
  }

  return {
    quote,
    turn: {
      ...turn,
      remaining: turn.remaining - quote.effective_cost,
      spent: turn.spent + quote.effective_cost,
    },
  };
}
