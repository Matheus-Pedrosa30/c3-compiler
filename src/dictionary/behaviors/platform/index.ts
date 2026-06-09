import type { BehaviorDefinition } from "../../../core/dictionary/dictionaryTypes.js";
import { simulateControl } from "./platformActions.js";
import { isMoving } from "./platformConditions.js";

export const PlatformBehavior = {
  id: "Platform",
  isMoving,
  simulateControl,
} as const;

export const platformBehaviorDefinition: BehaviorDefinition = {
  id: "Platform",
  constructName: "Platform",
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
