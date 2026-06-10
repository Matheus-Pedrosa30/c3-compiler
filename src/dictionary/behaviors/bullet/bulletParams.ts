import type { InvocationParam } from "../../../core/ir/irTypes.js";

export type BulletComparison =
  | "equal"
  | "not-equal"
  | "less"
  | "less-or-equal"
  | "greater"
  | "greater-or-equal";

export function numberParam(name: string, value: number): InvocationParam {
  return {
    name,
    valueType: "number",
    value,
  };
}

export function numberExpressionParam(name: string, value: number | string): InvocationParam {
  return {
    name,
    valueType: typeof value === "number" ? "number" : "expression",
    value,
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
