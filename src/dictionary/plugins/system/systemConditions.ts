import type { ConditionDraft } from "../../../core/ir/irFactory.js";
import {
  compareTwoValuesParams,
  type SystemComparison,
} from "./systemParams.js";

export function otherwise(): ConditionDraft {
  return {
    kind: "condition",
    dictionaryId: "System",
    constructId: "else",
    params: [],
  };
}

export function compareTwoValues(
  firstValue: string,
  comparison: SystemComparison,
  secondValue: string | number,
): ConditionDraft {
  return {
    kind: "condition",
    dictionaryId: "System",
    constructId: "compare-two-values",
    params: compareTwoValuesParams(firstValue, comparison, secondValue),
  };
}
