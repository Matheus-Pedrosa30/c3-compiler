import type { PluginDefinition } from "../../../core/dictionary/dictionaryTypes.js";
import { compareTwoValues, otherwise } from "./systemConditions.js";

export const SystemPlugin = {
  else: otherwise,
  otherwise,
  compareTwoValues,
} as const;

export const systemPluginDefinition: PluginDefinition = {
  id: "System",
  constructName: "System",
  conditions: [
    {
      kind: "condition",
      id: "else",
      constructId: "else",
      params: [],
    },
    {
      kind: "condition",
      id: "compareTwoValues",
      constructId: "compare-two-values",
      params: [
        { name: "first-value", valueType: "expression", required: true },
        { name: "comparison", valueType: "enum", required: true },
        { name: "second-value", valueType: "expression", required: true },
      ],
    },
  ],
};
