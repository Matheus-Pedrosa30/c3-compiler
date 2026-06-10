import { createBehaviorAction } from "../../bindings/capabilityDescriptor.js";
import { booleanParam, numberParam, objectParam } from "./bulletParams.js";

export function setSpeed(speed: number) {
  return createBehaviorAction("Bullet", "set-speed", [
    numberParam("speed", speed),
  ]);
}

export function setAcceleration(acceleration: number) {
  return createBehaviorAction("Bullet", "set-acceleration", [
    numberParam("acceleration", acceleration),
  ]);
}

export function setAngleOfMotion(angle: number) {
  return createBehaviorAction("Bullet", "set-angle-of-motion", [
    numberParam("angle", angle),
  ]);
}

export function bounceOffObject(objectName: string) {
  return createBehaviorAction("Bullet", "bounce-off-object", [
    objectParam("object", objectName),
  ]);
}

export function setEnabled(isEnabled: boolean) {
  return createBehaviorAction("Bullet", "set-enabled", [
    booleanParam("state", isEnabled),
  ]);
}
