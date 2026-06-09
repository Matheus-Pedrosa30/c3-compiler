import type { ConstructSid } from "../ir/irTypes.js";
import type { SidOccurrence } from "./sidScanner.js";

export class SidRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SidRegistryError";
  }
}

export class SidRegistry {
  readonly #usedSids = new Set<ConstructSid>();
  #nextSid: ConstructSid;

  private constructor(initialSids: readonly ConstructSid[]) {
    for (const sid of initialSids) {
      this.#usedSids.add(sid);
    }

    this.#nextSid = this.#calculateNextSid();
  }

  static fromOccurrences(occurrences: readonly SidOccurrence[]): SidRegistry {
    assertNoDuplicateOccurrences(occurrences);
    return new SidRegistry(occurrences.map((occurrence) => occurrence.sid));
  }

  static empty(): SidRegistry {
    return new SidRegistry([]);
  }

  get usedSids(): ReadonlySet<ConstructSid> {
    return this.#usedSids;
  }

  get nextSid(): ConstructSid {
    return this.#nextSid;
  }

  has(sid: ConstructSid): boolean {
    return this.#usedSids.has(sid);
  }

  allocate(): ConstructSid {
    const sid = this.#nextSid;
    this.reserve(sid);
    return sid;
  }

  reserve(sid: ConstructSid): void {
    assertSidIsAllocatable(sid);

    if (this.#usedSids.has(sid)) {
      throw new SidRegistryError(
        `SID collision while reserving ${sid}. The SID is already in use.`,
      );
    }

    this.#usedSids.add(sid);

    if (sid >= this.#nextSid) {
      this.#nextSid = sid + 1;
    }
  }

  snapshot(): ReadonlySet<ConstructSid> {
    return new Set(this.#usedSids);
  }

  #calculateNextSid(): ConstructSid {
    let maxSid = 0;

    for (const sid of this.#usedSids) {
      if (sid > maxSid) {
        maxSid = sid;
      }
    }

    return maxSid + 1;
  }
}

function assertNoDuplicateOccurrences(
  occurrences: readonly SidOccurrence[],
): void {
  const firstLocationBySid = new Map<ConstructSid, SidOccurrence>();

  for (const occurrence of occurrences) {
    const firstOccurrence = firstLocationBySid.get(occurrence.sid);

    if (firstOccurrence !== undefined) {
      throw new SidRegistryError(
        [
          `Duplicate SID ${occurrence.sid} detected in the source project.`,
          `First occurrence: ${formatOccurrence(firstOccurrence)}.`,
          `Second occurrence: ${formatOccurrence(occurrence)}.`,
          "Compilation aborted before writing any generated files.",
        ].join(" "),
      );
    }

    firstLocationBySid.set(occurrence.sid, occurrence);
  }
}

function assertSidIsAllocatable(sid: ConstructSid): void {
  if (!Number.isSafeInteger(sid) || sid <= 0) {
    throw new SidRegistryError(
      `Invalid SID ${sid}. Expected a positive safe integer.`,
    );
  }
}

function formatOccurrence(occurrence: SidOccurrence): string {
  return `${occurrence.location.filePath}:${occurrence.location.jsonPath}`;
}
