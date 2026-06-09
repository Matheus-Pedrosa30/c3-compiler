import type { ObjectTypeDefinition } from "../../core/dictionary/dictionaryTypes.js";
import type { InvocationParam } from "../../core/ir/irTypes.js";
import { createObjectAction } from "../bindings/capabilityDescriptor.js";

export function setAnimationSpeed(speed: number | string) {
  return createObjectAction("set-animation-speed", [
    animationSpeedParam(speed),
  ]);
}

export const SpriteObject = {
  setAnimationSpeed,
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
