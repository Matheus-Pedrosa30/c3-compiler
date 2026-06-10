import type { PluginDefinition } from "../../../core/dictionary/dictionaryTypes.js";
import { createObject } from "./systemActions.js";
import { compareTwoValues, everyTick, onStartOfLayout, otherwise } from "./systemConditions.js";

export const SystemPlugin = {
  else: otherwise,
  otherwise,
  everyTick,
  onStartOfLayout,
  compareTwoValues,
  createObject,
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
  actions: [
    {
      kind: "action",
      id: "createObject",
      constructId: "create-object",
      params: [
        { name: "object-to-create", valueType: "object", required: true },
        { name: "layer", valueType: "expression", required: true },
        { name: "x", valueType: "expression", required: true },
        { name: "y", valueType: "expression", required: true },
        { name: "create-hierarchy", valueType: "boolean", required: true },
        { name: "template-name", valueType: "string", required: true },
      ],
    },
  ],
};
