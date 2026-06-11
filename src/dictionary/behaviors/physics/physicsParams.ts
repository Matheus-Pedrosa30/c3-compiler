import type { InvocationParam } from "../../../core/ir/irTypes.js";

export class PhysicsParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhysicsParamError";
  }
}

export type PhysicsComparison =
  | "equal"
  | "not-equal"
  | "less"
  | "less-or-equal"
  | "greater"
  | "greater-or-equal"
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5;

export type PhysicsVelocityComponent =
  | "x-velocity"
  | "y-velocity"
  | "overall-velocity";

const COMPARISON_CODES = {
  equal: 0,
  "not-equal": 1,
  less: 2,
  "less-or-equal": 3,
  greater: 4,
  "greater-or-equal": 5,
} as const;

export function numberExpressionParam(
  name: string,
  value: number | string,
): InvocationParam {
  assertFiniteNumberOrExpression(value, `Physics ${name}`);

  return {
    name,
    valueType: "expression",
    value: typeof value === "number" ? String(value) : value,
  };
}

export function enumParam(name: string, value: string): InvocationParam {
  assertNonEmptyString(value, `Physics ${name}`);

  return {
    name,
    valueType: "enum",
    value,
  };
}

export function objectParam(name: string, value: string): InvocationParam {
  assertNonEmptyString(value, `Physics ${name}`);

  return {
    name,
    valueType: "object",
    value,
  };
}

export function comparisonParam(comparison: PhysicsComparison): InvocationParam {
  return {
    name: "comparison",
    valueType: "number",
    value: normalizeComparison(comparison),
  };
}

export function velocityComponentParam(
  which: PhysicsVelocityComponent,
): InvocationParam {
  return enumParam("which", which);
}

function normalizeComparison(comparison: PhysicsComparison): number {
  if (typeof comparison === "number") {
    if (!Number.isInteger(comparison) || comparison < 0 || comparison > 5) {
      throw new PhysicsParamError(
        "Physics comparison code must be an integer between 0 and 5.",
      );
    }

    return comparison;
  }

  return COMPARISON_CODES[comparison];
}

function assertFiniteNumberOrExpression(
  value: number | string,
  label: string,
): void {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new PhysicsParamError(`${label} must be a finite number.`);
    }

    return;
  }

  assertNonEmptyString(value, label);
}

function assertNonEmptyString(value: string, label: string): void {
  if (typeof value !== "string" || value.length === 0) {
    throw new PhysicsParamError(
      `${label} must be a non-empty Construct expression string.`,
    );
  }
}
