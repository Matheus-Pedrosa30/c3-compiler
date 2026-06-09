import type { ConstructSid } from "../ir/irTypes.js";

export interface SidLocation {
  readonly filePath: string;
  readonly jsonPath: string;
}

export interface SidOccurrence {
  readonly sid: ConstructSid;
  readonly location: SidLocation;
}

export class SidScanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SidScanError";
  }
}

export function scanSidsInJson(
  value: unknown,
  filePath: string,
): readonly SidOccurrence[] {
  const occurrences: SidOccurrence[] = [];
  scanValue(value, filePath, "$", occurrences);
  return occurrences;
}

function scanValue(
  value: unknown,
  filePath: string,
  jsonPath: string,
  occurrences: SidOccurrence[],
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      scanValue(item, filePath, `${jsonPath}[${index}]`, occurrences);
    });
    return;
  }

  if (!isJsonObject(value)) {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${jsonPath}.${escapeJsonPathSegment(key)}`;

    if (key === "sid") {
      occurrences.push({
        sid: assertValidSid(child, filePath, childPath),
        location: {
          filePath,
          jsonPath: childPath,
        },
      });
      continue;
    }

    scanValue(child, filePath, childPath, occurrences);
  }
}

function assertValidSid(
  value: unknown,
  filePath: string,
  jsonPath: string,
): ConstructSid {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value <= 0
  ) {
    throw new SidScanError(
      `Invalid sid at ${filePath}:${jsonPath}. Expected a positive safe integer.`,
    );
  }

  return value;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeJsonPathSegment(segment: string): string {
  if (/^[A-Za-z_$][\w$]*$/.test(segment)) {
    return segment;
  }

  return JSON.stringify(segment);
}
