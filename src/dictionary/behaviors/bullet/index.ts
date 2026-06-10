import type { BehaviorDefinition } from "../../../core/dictionary/dictionaryTypes.js";
import {
  bounceOffObject,
  setAcceleration,
  setAngleOfMotion,
  setEnabled,
  setSpeed,
} from "./bulletActions.js";
import {
  compareDistanceTravelled,
  compareSpeed,
  isEnabled,
} from "./bulletConditions.js";

export const BulletBehavior = {
  id: "Bullet",
  bounceOffObject,
  compareDistanceTravelled,
  compareSpeed,
  isEnabled,
  setAcceleration,
  setAngleOfMotion,
  setEnabled,
  setSpeed,
} as const;

export const bulletBehaviorDefinition: BehaviorDefinition = {
  id: "Bullet",
  constructName: "Bullet",
  conditions: [
    {
      kind: "condition",
      id: "compareSpeed",
      constructId: "compare-speed",
      params: [
        { name: "comparison", valueType: "enum", required: true },
        { name: "speed", valueType: "number", required: true },
      ],
    },
    {
      kind: "condition",
      id: "compareDistanceTravelled",
      constructId: "compare-distance-travelled",
      params: [
        { name: "comparison", valueType: "enum", required: true },
        { name: "distance", valueType: "number", required: true },
      ],
    },
    {
      kind: "condition",
      id: "isEnabled",
      constructId: "is-enabled",
      params: [],
    },
  ],
  actions: [
    {
      kind: "action",
      id: "setSpeed",
      constructId: "set-speed",
      params: [{ name: "speed", valueType: "number", required: true }],
    },
    {
      kind: "action",
      id: "setAcceleration",
      constructId: "set-acceleration",
      params: [{ name: "acceleration", valueType: "number", required: true }],
    },
    {
      kind: "action",
      id: "setAngleOfMotion",
      constructId: "set-angle-of-motion",
      params: [{ name: "angle", valueType: "number", required: true }],
    },
    {
      kind: "action",
      id: "bounceOffObject",
      constructId: "bounce-off-object",
      params: [{ name: "object", valueType: "object", required: true }],
    },
    {
      kind: "action",
      id: "setEnabled",
      constructId: "set-enabled",
      params: [{ name: "state", valueType: "boolean", required: true }],
    },
  ],
};
