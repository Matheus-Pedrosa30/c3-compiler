import type { ConstructSid } from "../ir/irTypes.js";
import { SidRegistry } from "./sidRegistry.js";

export interface SidAllocator {
  allocate(): ConstructSid;
  reserve(sid: ConstructSid): void;
  has(sid: ConstructSid): boolean;
}

export function createSequentialHighSidAllocator(
  registry: SidRegistry,
): SidAllocator {
  return registry;
}
