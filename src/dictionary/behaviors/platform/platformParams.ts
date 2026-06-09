import type { InvocationParam } from "../../../core/ir/irTypes.js";

export type PlatformControl = "left" | "right" | "jump";

export function controlParam(control: PlatformControl): InvocationParam {
  return {
    name: "control",
    valueType: "enum",
    value: control,
  };
}
