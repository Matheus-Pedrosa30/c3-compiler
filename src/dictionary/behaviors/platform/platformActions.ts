import { createBehaviorAction } from "../../bindings/capabilityDescriptor.js";
import { controlParam, type PlatformControl } from "./platformParams.js";

export function simulateControl(control: PlatformControl) {
  return createBehaviorAction("Platform", "simulate-control", [
    controlParam(control),
  ]);
}
