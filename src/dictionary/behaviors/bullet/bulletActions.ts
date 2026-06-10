import { createBehaviorAction } from "../../bindings/capabilityDescriptor.js";
import { booleanParam, numberExpressionParam, numberParam, objectParam } from "./bulletParams.js";

const BULLET_BEHAVIOR_ID = "Bullet";

export function setSpeed(speed: number) {
  return createBehaviorAction(BULLET_BEHAVIOR_ID, "set-speed", [
    numberParam("speed", speed),
  ]);
}

export function setAcceleration(acceleration: number) {
  return createBehaviorAction(BULLET_BEHAVIOR_ID, "set-acceleration", [
    numberParam("acceleration", acceleration),
  ]);
}

export function setAngleOfMotion(angle: number | string) {
  return createBehaviorAction(BULLET_BEHAVIOR_ID, "set-angle-of-motion", [
    numberExpressionParam("angle", angle),
  ]);
}

export function bounceOffObject(objectName: string) {
  return createBehaviorAction(BULLET_BEHAVIOR_ID, "bounce-off-object", [
    objectParam("object", objectName),
  ]);
}

export function setEnabled(isEnabled: boolean) {
  return createBehaviorAction(BULLET_BEHAVIOR_ID, "set-enabled", [
    booleanParam("state", isEnabled),
  ]);
}
