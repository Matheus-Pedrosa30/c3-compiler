import type { ObjectTypeDefinition } from "../../core/dictionary/dictionaryTypes.js";
import type { InvocationParam } from "../../core/ir/irTypes.js";
import { createObjectAction, createObjectCondition } from "../bindings/capabilityDescriptor.js";

export function setAnimationSpeed(speed: number | string) {
  return createObjectAction("set-animation-speed", [
    animationSpeedParam(speed),
  ]);
}

export function setMirrored(isMirrored: boolean) {
  return createObjectAction("set-mirrored", [
    {
      name: "state",
      valueType: "enum",
      value: isMirrored ? "mirrored" : "not-mirrored",
    },
  ]);
}

export function setAnimationFrame(frameNumber: number | string) {
  return createObjectAction("set-animation-frame", [
    {
      name: "frame-number",
      valueType: typeof frameNumber === "number" ? "number" : "expression",
      value: frameNumber,
    },
  ]);
}

export function setInstanceVariable(instanceVariable: string, value: string) {
  return createObjectAction("set-instvar-value", [
    {
      name: "instance-variable",
      valueType: "string",
      value: instanceVariable,
    },
    {
      name: "value",
      valueType: "expression",
      value,
    },
  ]);
}

export function setAnimation(animation: string, from: "beginning" | "current-frame") {
  return createObjectAction("set-animation", [
    {
      name: "animation",
      valueType: "expression",
      value: animation,
    },
    {
      name: "from",
      valueType: "enum",
      value: from,
    },
  ]);
}

export function setPosition(x: string, y: string) {
  return createObjectAction("set-position", [
    {
      name: "x",
      valueType: "expression",
      value: x,
    },
    {
      name: "y",
      valueType: "expression",
      value: y,
    },
  ]);
}

export function onAnimationFinished(animation: string) {
  return createObjectCondition("on-animation-finished", [
    {
      name: "animation",
      valueType: "expression",
      value: animation,
    },
  ]);
}

export const SpriteObject = {
  id: "Sprite",
  setAnimationSpeed,
  setMirrored,
  setAnimationFrame,
  setInstanceVariable,
  setAnimation,
  setPosition,
  onAnimationFinished,
} as const;

export const spriteObjectDefinition: ObjectTypeDefinition = {
  id: "Sprite",
  constructType: "Sprite",
};

function animationSpeedParam(speed: number | string): InvocationParam {
  return {
    name: "speed",
    valueType: typeof speed === "number" ? "number" : "expression",
    value: speed,
  };
}
