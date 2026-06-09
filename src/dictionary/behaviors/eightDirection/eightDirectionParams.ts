import type { InvocationParam } from "../../../core/ir/irTypes.js";

export type EightDirectionControl = "up" | "down" | "left" | "right";

export function controlParam(control: EightDirectionControl): InvocationParam {
  return {
    name: "control",
    valueType: "enum",
    value: control,
  };
}
