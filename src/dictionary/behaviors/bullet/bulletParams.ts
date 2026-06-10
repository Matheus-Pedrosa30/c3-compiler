import type { InvocationParam } from "../../../core/ir/irTypes.js";

export class BulletParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BulletParamError";
  }
}

export type BulletComparison =
  | "equal"
  | "not-equal"
  | "less"
  | "less-or-equal"
  | "greater"
  | "greater-or-equal";

export function numberParam(name: string, value: number): InvocationParam {
  assertFiniteNumber(value, `Bullet ${name}`);

  return {
    name,
    valueType: "expression",
    value: String(value),
  };
}

export function numberExpressionParam(name: string, value: number | string): InvocationParam {
  assertFiniteNumberOrExpression(value, `Bullet ${name}`);

  return {
    name,
    valueType: "expression",
    value: typeof value === "number" ? String(value) : value,
  };
}

export function booleanParam(name: string, value: boolean): InvocationParam {
  return {
    name,
    valueType: "boolean",
    value,
  };
}

export function objectParam(name: string, objectName: string): InvocationParam {
  return {
    name,
    valueType: "object",
    value: objectName,
  };
}

export function comparisonParam(comparison: BulletComparison): InvocationParam {
  return {
    name: "comparison",
    valueType: "enum",
    value: comparison,
  };
}

function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new BulletParamError(`${label} must be a finite number.`);
  }
}

function assertFiniteNumberOrExpression(
  value: number | string,
  label: string,
): void {
  if (typeof value === "number") {
    assertFiniteNumber(value, label);
    return;
  }

  if (typeof value !== "string" || value.length === 0) {
    throw new BulletParamError(
      `${label} must be a finite number or a non-empty Construct expression string.`,
    );
  }
}
