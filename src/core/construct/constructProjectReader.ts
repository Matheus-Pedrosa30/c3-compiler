import { constants } from "node:fs";
import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type {
  ConstructObjectRef,
  ConstructProjectSnapshot,
  ConstructSid,
} from "../ir/irTypes.js";
import { SidRegistry } from "../sid/sidRegistry.js";
import { scanSidsInJson, type SidOccurrence } from "../sid/sidScanner.js";

export interface ConstructProjectReaderOptions {
  readonly objectTypesDirName?: string;
  readonly allowDuplicateSourceSids?: boolean;
}

export class ConstructProjectReaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConstructProjectReaderError";
  }
}

export class ConstructProjectReader {
  readonly #objectTypesDirName: string;
  readonly #allowDuplicateSourceSids: boolean;

  constructor(options: ConstructProjectReaderOptions = {}) {
    this.#objectTypesDirName = options.objectTypesDirName ?? "objectTypes";
    this.#allowDuplicateSourceSids = options.allowDuplicateSourceSids ?? false;
  }

  async read(projectRoot: string): Promise<ConstructProjectSnapshot> {
    const normalizedProjectRoot = path.resolve(projectRoot);
    await assertReadableDirectory(normalizedProjectRoot, "project root");

    const objectTypesDir = path.join(
      normalizedProjectRoot,
      this.#objectTypesDirName,
    );
    const hasObjectTypesDir = await isReadableDirectory(objectTypesDir);

    const projectJsonFiles = await findConstructJsonFiles(normalizedProjectRoot);
    const sidOccurrences = await collectSidOccurrences(projectJsonFiles);
    const sidRegistry = this.#allowDuplicateSourceSids
      ? SidRegistry.fromSids(sidOccurrences.map((occurrence) => occurrence.sid))
      : SidRegistry.fromOccurrences(sidOccurrences);
    const objectsByName = hasObjectTypesDir
      ? await readObjectCatalog(objectTypesDir)
      : new Map<string, ConstructObjectRef>();

    assertObjectSidsAreIndexed(objectsByName, sidRegistry.usedSids);

    return {
      projectRoot: normalizedProjectRoot,
      objectTypesDir,
      objectsByName,
      usedSids: sidRegistry.snapshot(),
    };
  }
}

export async function readConstructProject(
  projectRoot: string,
  options?: ConstructProjectReaderOptions,
): Promise<ConstructProjectSnapshot> {
  return new ConstructProjectReader(options).read(projectRoot);
}

async function collectSidOccurrences(
  jsonFiles: readonly string[],
): Promise<readonly SidOccurrence[]> {
  const occurrences: SidOccurrence[] = [];

  for (const filePath of jsonFiles) {
    const json = await readJsonFile(filePath);
    occurrences.push(...scanSidsInJson(json, filePath));
  }

  return occurrences;
}

async function readObjectCatalog(
  objectTypesDir: string,
): Promise<ReadonlyMap<string, ConstructObjectRef>> {
  const objectFiles = await findConstructJsonFiles(objectTypesDir);
  const objectsByName = new Map<string, ConstructObjectRef>();

  for (const filePath of objectFiles) {
    const json = await readJsonFile(filePath);
    const objectRef = extractObjectRef(json, filePath);
    const existingObject = objectsByName.get(objectRef.name);

    if (existingObject !== undefined) {
      throw new ConstructProjectReaderError(
        [
          `Duplicate object name "${objectRef.name}" in objectTypes/.`,
          `Object names are case-sensitive and must be unique.`,
          `First SID: ${existingObject.sid}. Second SID: ${objectRef.sid}.`,
          `File: ${filePath}.`,
        ].join(" "),
      );
    }

    objectsByName.set(objectRef.name, objectRef);
  }

  return objectsByName;
}

function extractObjectRef(
  value: unknown,
  filePath: string,
): ConstructObjectRef {
  if (!isJsonObject(value)) {
    throw new ConstructProjectReaderError(
      `Invalid object type file ${filePath}. Expected a JSON object.`,
    );
  }

  const name = value.name;
  const sid = value.sid;

  if (typeof name !== "string" || name.length === 0) {
    throw new ConstructProjectReaderError(
      `Invalid object type file ${filePath}. Missing non-empty string field "name".`,
    );
  }

  if (!isValidSid(sid)) {
    throw new ConstructProjectReaderError(
      `Invalid object type file ${filePath}. Missing positive integer field "sid".`,
    );
  }

  return {
    name,
    sid,
    objectTypeId: extractObjectTypeId(value),
    behaviors: extractBehaviorRefs(value, filePath),
  };
}

function extractBehaviorRefs(
  value: Record<string, unknown>,
  filePath: string,
): readonly ConstructObjectRef["behaviors"][number][] {
  const behaviorTypes = value.behaviorTypes;

  if (behaviorTypes === undefined) {
    return [];
  }

  if (!Array.isArray(behaviorTypes)) {
    throw new ConstructProjectReaderError(
      `Invalid object type file ${filePath}. Field "behaviorTypes" must be an array.`,
    );
  }

  return behaviorTypes.map((behaviorType, index) => {
    if (!isJsonObject(behaviorType)) {
      throw new ConstructProjectReaderError(
        `Invalid behaviorTypes[${index}] in ${filePath}. Expected a JSON object.`,
      );
    }

    const behaviorId = behaviorType.behaviorId;
    const name = behaviorType.name;
    const sid = behaviorType.sid;

    if (typeof behaviorId !== "string" || behaviorId.length === 0) {
      throw new ConstructProjectReaderError(
        `Invalid behaviorTypes[${index}] in ${filePath}. Missing non-empty string field "behaviorId".`,
      );
    }

    if (typeof name !== "string" || name.length === 0) {
      throw new ConstructProjectReaderError(
        `Invalid behaviorTypes[${index}] in ${filePath}. Missing non-empty string field "name".`,
      );
    }

    if (!isValidSid(sid)) {
      throw new ConstructProjectReaderError(
        `Invalid behaviorTypes[${index}] in ${filePath}. Missing positive integer field "sid".`,
      );
    }

    return {
      behaviorId,
      name,
      sid,
    };
  });
}

function extractObjectTypeId(value: Record<string, unknown>): string {
  const candidates = [
    value.objectTypeId,
    value.pluginId,
    value["plugin-id"],
    value.type,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  return "construct-object";
}

async function findConstructJsonFiles(
  directory: string,
): Promise<readonly string[]> {
  const files: string[] = [];
  await collectConstructJsonFiles(directory, files);
  return files.sort((left, right) => left.localeCompare(right));
}

async function collectConstructJsonFiles(
  directory: string,
  files: string[],
): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "uistate") {
        continue;
      }

      await collectConstructJsonFiles(entryPath, files);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (isConstructJsonFile(entry.name)) {
      files.push(entryPath);
    }
  }
}

function isConstructJsonFile(fileName: string): boolean {
  return fileName.endsWith(".json") && !fileName.endsWith(".uistate.json");
}

async function readJsonFile(filePath: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);

    throw new ConstructProjectReaderError(
      `Failed to parse JSON file ${filePath}: ${detail}`,
    );
  }
}

async function assertReadableDirectory(
  directory: string,
  label: string,
): Promise<void> {
  try {
    await access(directory, constants.R_OK);
    const stats = await stat(directory);

    if (!stats.isDirectory()) {
      throw new ConstructProjectReaderError(
        `Expected ${label} to be a directory: ${directory}`,
      );
    }
  } catch (error) {
    if (error instanceof ConstructProjectReaderError) {
      throw error;
    }

    const detail = error instanceof Error ? error.message : String(error);
    throw new ConstructProjectReaderError(
      `Cannot read ${label} at ${directory}: ${detail}`,
    );
  }
}

async function isReadableDirectory(directory: string): Promise<boolean> {
  try {
    await access(directory, constants.R_OK);
    const stats = await stat(directory);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

function assertObjectSidsAreIndexed(
  objectsByName: ReadonlyMap<string, ConstructObjectRef>,
  usedSids: ReadonlySet<ConstructSid>,
): void {
  for (const objectRef of objectsByName.values()) {
    if (!usedSids.has(objectRef.sid)) {
      throw new ConstructProjectReaderError(
        [
          `Object "${objectRef.name}" has SID ${objectRef.sid},`,
          "but that SID was not found during the project-wide SID scan.",
          "Compilation aborted before writing any generated files.",
        ].join(" "),
      );
    }
  }
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidSid(value: unknown): value is ConstructSid {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
