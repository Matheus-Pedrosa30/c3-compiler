import type { BehaviorDefinition } from "../../../core/dictionary/dictionaryTypes.js";
import { simulateControl } from "./eightDirectionActions.js";
import { isMoving } from "./eightDirectionConditions.js";

export const EightDirectionBehavior = {
  isMoving,
  simulateControl,
} as const;

export const eightDirectionBehaviorDefinition: BehaviorDefinition = {
  id: "8Direction",
  constructName: "8Direction",
  conditions: [
    {
      kind: "condition",
      id: "isMoving",
      constructId: "is-moving",
      params: [],
    },
  ],
  actions: [
    {
      kind: "action",
      id: "simulateControl",
      constructId: "simulate-control",
      params: [{ name: "control", valueType: "enum", required: true }],
    },
  ],
};
