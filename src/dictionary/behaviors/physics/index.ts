import type { BehaviorDefinition } from "../../../core/dictionary/dictionaryTypes.js";
import {
  applyForce,
  applyForceAtAngle,
  applyImpulseAtAngle,
  setAngularDamping,
  setAngularVelocity,
  setDensity,
  setElasticity,
  setEnabled,
  setFriction,
  setImmovable,
  setVelocity,
  setWorldGravity,
  teleport,
} from "./physicsActions.js";
import {
  compareAngularVelocity,
  compareMass,
  compareVelocity,
  isEnabled,
  isSleeping,
  onCollisionWithAnotherObject,
} from "./physicsConditions.js";

export const PhysicsBehavior = {
  id: "Physics",
  applyForce,
  applyForceAtAngle,
  applyImpulseAtAngle,
  compareAngularVelocity,
  compareMass,
  compareVelocity,
  isEnabled,
  isSleeping,
  onCollisionWithAnotherObject,
  setAngularDamping,
  setAngularVelocity,
  setDensity,
  setElasticity,
  setEnabled,
  setFriction,
  setImmovable,
  setVelocity,
  setWorldGravity,
  teleport,
} as const;

export const physicsBehaviorDefinition: BehaviorDefinition = {
  id: "Physics",
  constructName: "Physics",
  conditions: [
    {
      kind: "condition",
      id: "onCollisionWithAnotherObject",
      constructId: "on-collision-with-another-object",
      params: [{ name: "object", valueType: "object", required: true }],
    },
    {
      kind: "condition",
      id: "isSleeping",
      constructId: "is-sleeping",
      params: [],
    },
    {
      kind: "condition",
      id: "isEnabled",
      constructId: "is-enabled",
      params: [],
    },
    {
      kind: "condition",
      id: "compareMass",
      constructId: "compare-mass",
      params: [
        { name: "comparison", valueType: "number", required: true },
        { name: "value", valueType: "expression", required: true },
      ],
    },
    {
      kind: "condition",
      id: "compareVelocity",
      constructId: "compare-velocity",
      params: [
        { name: "which", valueType: "enum", required: true },
        { name: "comparison", valueType: "number", required: true },
        { name: "value", valueType: "expression", required: true },
      ],
    },
    {
      kind: "condition",
      id: "compareAngularVelocity",
      constructId: "compare-angular-velocity",
      params: [
        { name: "comparison", valueType: "number", required: true },
        { name: "value", valueType: "expression", required: true },
      ],
    },
  ],
  actions: [
    {
      kind: "action",
      id: "setEnabled",
      constructId: "set-enabled",
      params: [{ name: "mode", valueType: "enum", required: true }],
    },
    {
      kind: "action",
      id: "setImmovable",
      constructId: "set-immovable",
      params: [{ name: "setting", valueType: "enum", required: true }],
    },
    {
      kind: "action",
      id: "setWorldGravity",
      constructId: "set-world-gravity",
      params: [{ name: "gravity", valueType: "expression", required: true }],
    },
    {
      kind: "action",
      id: "setDensity",
      constructId: "set-density",
      params: [{ name: "density", valueType: "expression", required: true }],
    },
    {
      kind: "action",
      id: "setFriction",
      constructId: "set-friction",
      params: [{ name: "friction", valueType: "expression", required: true }],
    },
    {
      kind: "action",
      id: "setElasticity",
      constructId: "set-elasticity",
      params: [{ name: "elasticity", valueType: "expression", required: true }],
    },
    {
      kind: "action",
      id: "applyImpulseAtAngle",
      constructId: "apply-impulse-at-angle",
      params: [
        { name: "impulse", valueType: "expression", required: true },
        { name: "angle", valueType: "expression", required: true },
        { name: "image-point", valueType: "expression", required: true },
      ],
    },
    {
      kind: "action",
      id: "applyForceAtAngle",
      constructId: "apply-force-at-angle",
      params: [
        { name: "force", valueType: "expression", required: true },
        { name: "angle", valueType: "expression", required: true },
        { name: "image-point", valueType: "expression", required: true },
      ],
    },
    {
      kind: "action",
      id: "applyForce",
      constructId: "apply-force",
      params: [
        { name: "force-x", valueType: "expression", required: true },
        { name: "force-y", valueType: "expression", required: true },
        { name: "image-point", valueType: "expression", required: true },
      ],
    },
    {
      kind: "action",
      id: "setVelocity",
      constructId: "set-velocity",
      params: [
        { name: "x-component", valueType: "expression", required: true },
        { name: "y-component", valueType: "expression", required: true },
      ],
    },
    {
      kind: "action",
      id: "setAngularVelocity",
      constructId: "set-angular-velocity",
      params: [
        { name: "angular-velocity", valueType: "expression", required: true },
      ],
    },
    {
      kind: "action",
      id: "setAngularDamping",
      constructId: "set-angular-damping",
      params: [
        { name: "angular-damping", valueType: "expression", required: true },
      ],
    },
    {
      kind: "action",
      id: "teleport",
      constructId: "teleport",
      params: [
        { name: "x", valueType: "expression", required: true },
        { name: "y", valueType: "expression", required: true },
      ],
    },
  ],
};
