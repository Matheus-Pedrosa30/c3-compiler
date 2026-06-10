import type { InvocationParam } from "../../../core/ir/irTypes.js";

export type SystemComparison =
  | "equal"
  | "not-equal"
  | "less"
  | "less-or-equal"
  | "greater"
  | "greater-or-equal";

export class SystemParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SystemParamError";
  }
}

const SYSTEM_COMPARISON_CODES: Record<SystemComparison, number> = {
  "equal": 0,
  "not-equal": 1,
  "less": 2,
  "less-or-equal": 3,
  "greater": 4,
  "greater-or-equal": 5,
};

export function compareTwoValuesParams(
  firstValue: string,
  comparison: SystemComparison,
  secondValue: string | number,
): readonly InvocationParam[] {
  assertExpressionString(firstValue, "System.compareTwoValues firstValue");
  assertSystemComparison(comparison);
  assertExpressionOrFiniteNumber(
    secondValue,
    "System.compareTwoValues secondValue",
  );

  return [
    {
      name: "first-value",
      valueType: "expression",
      value: firstValue,
    },
    {
      name: "comparison",
      valueType: "enum",
      value: encodeSystemComparison(comparison),
    },
    {
      name: "second-value",
      valueType: typeof secondValue === "number" ? "number" : "expression",
      value: secondValue,
    },
  ];
}

export function encodeSystemComparison(comparison: SystemComparison): number {
  assertSystemComparison(comparison);
  return SYSTEM_COMPARISON_CODES[comparison];
}

function assertSystemComparison(
  comparison: string,
): asserts comparison is SystemComparison {
  if (!Object.hasOwn(SYSTEM_COMPARISON_CODES, comparison)) {
    throw new SystemParamError(
      [
        `Invalid System.compareTwoValues comparison "${comparison}".`,
        `Use one of: ${Object.keys(SYSTEM_COMPARISON_CODES).join(", ")}.`,
        `Construct persists this dropdown as numeric codes 0..5; do not pass raw numbers or unknown labels.`,
      ].join(" "),
    );
  }
}

function assertExpressionString(value: string, label: string): void {
  if (typeof value !== "string" || value.length === 0) {
    throw new SystemParamError(
      `${label} must be a non-empty Construct expression string.`,
    );
  }
}

function assertExpressionOrFiniteNumber(
  value: string | number,
  label: string,
): void {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SystemParamError(`${label} must be a finite number.`);
    }

    return;
  }

  assertExpressionString(value, label);
}
