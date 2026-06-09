import { createBehaviorAction } from "../../bindings/capabilityDescriptor.js";
import type { InvocationParam } from "../../../core/ir/irTypes.js";

export interface PinToObjectPropertiesOptions {
  readonly x: boolean;
  readonly y: boolean;
  readonly angle: boolean;
  readonly width: "no" | "yes";
  readonly height: "no" | "yes";
  readonly z: boolean;
}

export function pinToObjectProperties(
  pinTo: string,
  options: PinToObjectPropertiesOptions,
) {
  return createBehaviorAction("Pin", "pin-to-object-properties", [
    param("pin-to", "object", pinTo),
    param("x", "boolean", options.x),
    param("y", "boolean", options.y),
    param("angle", "boolean", options.angle),
    param("width-type", "enum", options.width),
    param("height-type", "enum", options.height),
    param("z", "boolean", options.z),
  ]);
}

export const PinBehavior = {
  id: "Pin",
  pinToObjectProperties,
} as const;

function param(
  name: string,
  valueType: InvocationParam["valueType"],
  value: InvocationParam["value"],
): InvocationParam {
  return {
    name,
    valueType,
    value,
  };
}
