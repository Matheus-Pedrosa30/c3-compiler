import type { InvocationParam } from "../../../core/ir/irTypes.js";

export type SystemComparison =
  | "equal"
  | "not-equal"
  | "less"
  | "less-or-equal"
  | "greater"
  | "greater-or-equal";

export function compareTwoValuesParams(
  firstValue: string,
  comparison: SystemComparison,
  secondValue: string | number,
): readonly InvocationParam[] {
  return [
    {
      name: "first-value",
      valueType: "expression",
      value: firstValue,
    },
    {
      name: "comparison",
      valueType: "enum",
      value: comparison,
    },
    {
      name: "second-value",
      valueType: typeof secondValue === "number" ? "number" : "expression",
      value: secondValue,
    },
  ];
}
