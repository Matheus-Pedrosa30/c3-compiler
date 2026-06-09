import { createBehaviorAction } from "../../bindings/capabilityDescriptor.js";
import {
  controlParam,
  type EightDirectionControl,
} from "./eightDirectionParams.js";

export function simulateControl(control: EightDirectionControl) {
  return createBehaviorAction("8Direction", "simulate-control", [
    controlParam(control),
  ]);
}
