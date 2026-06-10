import { createBehaviorCondition } from "../../bindings/capabilityDescriptor.js";
import {
  comparisonParam,
  numberParam,
  type BulletComparison,
} from "./bulletParams.js";

export function compareSpeed(comparison: BulletComparison, speed: number) {
  return createBehaviorCondition("Bullet", "compare-speed", [
    comparisonParam(comparison),
    numberParam("speed", speed),
  ]);
}

export function compareDistanceTravelled(
  comparison: BulletComparison,
  distance: number,
) {
  return createBehaviorCondition("Bullet", "compare-distance-travelled", [
    comparisonParam(comparison),
    numberParam("distance", distance),
  ]);
}

export function isEnabled() {
  return createBehaviorCondition("Bullet", "is-enabled");
}
