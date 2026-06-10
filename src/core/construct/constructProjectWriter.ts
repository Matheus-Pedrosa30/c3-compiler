import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { atomicWriteJsonFile } from "./atomicWrite.js";
import type { AtomicJsonWriteResult } from "./atomicWrite.js";
import type { ConstructSid } from "../ir/irTypes.js";

export interface SyncEventSheetManifestInput {
  readonly projectRoot: string;
  readonly outputPath: string;
  readonly sheetName: string;
  readonly sheetSid: ConstructSid;
  readonly backupExisting?: boolean;
}

export interface SyncEventSheetManifestResult {
  readonly changed: boolean;
  readonly manifestPath: string;
  readonly folder: string;
  readonly sheetName: string;
  readonly sheetSid: ConstructSid;
  readonly writeResult?: AtomicJsonWriteResult;
}

export interface SyncProjectUiStateInput {
  readonly projectRoot: string;
  readonly preferredEventSheet?: string;
  readonly backupExisting?: boolean;
}

export interface SyncProjectUiStateResult {
  readonly changed: boolean;
  readonly uiStatePath: string;
  readonly removedTabs: readonly string[];
  readonly writeResult?: AtomicJsonWriteResult;
}

interface ProjectManifest {
  eventSheets?: ProjectFolder;
  layouts?: ProjectFolder;
  [key: string]: unknown;
}

interface ProjectFolder {
  items: ProjectFolderItem[];
  subfolders: ProjectFolder[];
  name?: string;
  [key: string]: unknown;
}

type ProjectFolderItem = string | ProjectSheetItem;

interface ProjectSheetItem {
  name: string;
  sid?: ConstructSid;
  folder?: string;
  [key: string]: unknown;
}

export class ConstructProjectWriterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConstructProjectWriterError";
  }
}

export function syncEventSheetManifest(
  input: SyncEventSheetManifestInput,
): SyncEventSheetManifestResult {
  const projectRoot = path.resolve(input.projectRoot);
  const manifestPath = path.join(projectRoot, "project.c3proj");
  const relativeOutputPath = path.relative(projectRoot, path.resolve(input.outputPath));
  const folderSegments = getEventSheetFolderSegments(relativeOutputPath);
  const folder = folderSegments.join("/");
  const manifest = readProjectManifest(manifestPath);
  const eventSheets = requireEventSheetsFolder(manifest);
  const targetFolder = ensureFolderPath(eventSheets, folderSegments);

  if (folderHasSheet(targetFolder, input.sheetName)) {
    return {
      changed: false,
      manifestPath,
      folder,
      sheetName: input.sheetName,
      sheetSid: input.sheetSid,
    };
  }

  targetFolder.items.push(input.sheetName);

  const writeResult = atomicWriteJsonFile(
    manifestPath,
    `${JSON.stringify(manifest, null, "\t")}\n`,
    {
      tempExtension: ".tmp.c3proj",
      ...(input.backupExisting === undefined
        ? {}
        : { backupExisting: input.backupExisting }),
    },
  );

  return {
    changed: true,
    manifestPath,
    folder,
    sheetName: input.sheetName,
    sheetSid: input.sheetSid,
    writeResult,
  };
}

export function syncProjectUiState(
  input: SyncProjectUiStateInput,
): SyncProjectUiStateResult {
  const projectRoot = path.resolve(input.projectRoot);
  const manifestPath = path.join(projectRoot, "project.c3proj");
  const uiStatePath = path.join(projectRoot, "project.uistate.json");

  if (!existsSync(uiStatePath)) {
    return {
      changed: false,
      uiStatePath,
      removedTabs: [],
    };
  }

  const manifest = readProjectManifest(manifestPath);
  const validEventSheets = collectFolderItemNames(
    requireEventSheetsFolder(manifest),
  );
  const validLayouts = isProjectFolder(manifest.layouts)
    ? collectFolderItemNames(manifest.layouts)
    : new Set<string>();
  const uiState = readProjectUiState(uiStatePath);
  const openTabs = getOpenTabsState(uiState);

  if (openTabs === undefined) {
    return {
      changed: false,
      uiStatePath,
      removedTabs: [],
    };
  }

  const originalOpenTabs = Array.isArray(openTabs.open) ? openTabs.open : [];
  const keptOpenTabs = originalOpenTabs.filter((tab) =>
    isValidOpenTab(tab, validEventSheets, validLayouts),
  );
  const removedTabs = originalOpenTabs
    .filter((tab) => !isValidOpenTab(tab, validEventSheets, validLayouts))
    .map(formatOpenTab);
  let changed = keptOpenTabs.length !== originalOpenTabs.length;

  if (changed || openTabs.open !== keptOpenTabs) {
    openTabs.open = keptOpenTabs;
  }

  if (!isValidOpenTab(openTabs.active, validEventSheets, validLayouts)) {
    const replacement = selectReplacementActiveTab(
      keptOpenTabs,
      validEventSheets,
      validLayouts,
      input.preferredEventSheet,
    );

    if (replacement !== undefined) {
      openTabs.active = replacement;
      changed = true;
    }
  }

  if (!changed) {
    return {
      changed: false,
      uiStatePath,
      removedTabs,
    };
  }

  const writeResult = atomicWriteJsonFile(
    uiStatePath,
    `${JSON.stringify(uiState)}\n`,
    {
      tempExtension: ".tmp.uistate.json",
      ...(input.backupExisting === undefined
        ? {}
        : { backupExisting: input.backupExisting }),
    },
  );

  return {
    changed: true,
    uiStatePath,
    removedTabs,
    writeResult,
  };
}

function readProjectManifest(manifestPath: string): ProjectManifest {
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8")) as ProjectManifest;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new ConstructProjectWriterError(
      `Failed to read project manifest ${manifestPath}: ${detail}`,
    );
  }
}

function readProjectUiState(uiStatePath: string): Record<string, unknown> {
  try {
    const value = JSON.parse(readFileSync(uiStatePath, "utf8")) as unknown;

    if (!isJsonObject(value)) {
      throw new ConstructProjectWriterError(
        `Invalid project UI state ${uiStatePath}: expected a JSON object.`,
      );
    }

    return value;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new ConstructProjectWriterError(
      `Failed to read project UI state ${uiStatePath}: ${detail}`,
    );
  }
}

function requireEventSheetsFolder(manifest: ProjectManifest): ProjectFolder {
  if (!isProjectFolder(manifest.eventSheets)) {
    throw new ConstructProjectWriterError(
      'Invalid project.c3proj: missing "eventSheets" folder tree.',
    );
  }

  return manifest.eventSheets;
}

function collectFolderItemNames(folder: ProjectFolder): Set<string> {
  const names = new Set<string>();
  collectFolderItemNamesInto(folder, names);
  return names;
}

function collectFolderItemNamesInto(folder: ProjectFolder, names: Set<string>): void {
  for (const item of folder.items) {
    names.add(typeof item === "string" ? item : item.name);
  }

  for (const subfolder of folder.subfolders) {
    collectFolderItemNamesInto(subfolder, names);
  }
}

function ensureFolderPath(
  root: ProjectFolder,
  folderSegments: readonly string[],
): ProjectFolder {
  let currentFolder = root;

  for (const folderName of folderSegments) {
    const existingFolder = currentFolder.subfolders.find(
      (subfolder) => subfolder.name === folderName,
    );

    if (existingFolder !== undefined) {
      currentFolder = existingFolder;
      continue;
    }

    const newFolder: ProjectFolder = {
      items: [],
      subfolders: [],
      name: folderName,
    };
    currentFolder.subfolders.push(newFolder);
    currentFolder = newFolder;
  }

  return currentFolder;
}

function folderHasSheet(folder: ProjectFolder, sheetName: string): boolean {
  return folder.items.some((item) => {
    if (typeof item === "string") {
      return item === sheetName;
    }

    return item.name === sheetName;
  });
}

function getEventSheetFolderSegments(relativeOutputPath: string): string[] {
  const segments = relativeOutputPath.split(path.sep);

  if (segments[0] !== "eventSheets") {
    throw new ConstructProjectWriterError(
      `Event sheet output must be inside eventSheets/: ${relativeOutputPath}`,
    );
  }

  const fileName = segments.at(-1);

  if (fileName === undefined || !fileName.endsWith(".json")) {
    throw new ConstructProjectWriterError(
      `Event sheet output must end with .json: ${relativeOutputPath}`,
    );
  }

  return segments.slice(1, -1);
}

interface OpenTabsState {
  active?: unknown;
  open?: unknown;
}

interface OpenTab {
  name: string;
  type: string;
  [key: string]: unknown;
}

function getOpenTabsState(
  uiState: Record<string, unknown>,
): OpenTabsState | undefined {
  const openTabs = uiState.openTabs;

  if (!isJsonObject(openTabs)) {
    return undefined;
  }

  return openTabs as OpenTabsState;
}

function isValidOpenTab(
  value: unknown,
  validEventSheets: ReadonlySet<string>,
  validLayouts: ReadonlySet<string>,
): value is OpenTab {
  if (!isJsonObject(value)) {
    return false;
  }

  const name = value.name;
  const type = value.type;

  if (typeof name !== "string" || typeof type !== "string") {
    return false;
  }

  if (type === "eventSheet") {
    return validEventSheets.has(name);
  }

  if (type === "layout") {
    return validLayouts.has(name);
  }

  return true;
}

function selectReplacementActiveTab(
  openTabs: readonly unknown[],
  validEventSheets: ReadonlySet<string>,
  validLayouts: ReadonlySet<string>,
  preferredEventSheet?: string,
): OpenTab | undefined {
  if (
    preferredEventSheet !== undefined &&
    validEventSheets.has(preferredEventSheet)
  ) {
    const existingPreferredTab = openTabs.find(
      (tab): tab is OpenTab =>
        isValidOpenTab(tab, validEventSheets, validLayouts) &&
        tab.type === "eventSheet" &&
        tab.name === preferredEventSheet,
    );

    return existingPreferredTab ?? {
      name: preferredEventSheet,
      type: "eventSheet",
    };
  }

  const firstOpenTab = openTabs.find((tab): tab is OpenTab =>
    isValidOpenTab(tab, validEventSheets, validLayouts),
  );

  if (firstOpenTab !== undefined) {
    return firstOpenTab;
  }

  const firstEventSheet = validEventSheets.values().next().value as
    | string
    | undefined;

  if (firstEventSheet !== undefined) {
    return {
      name: firstEventSheet,
      type: "eventSheet",
    };
  }

  const firstLayout = validLayouts.values().next().value as string | undefined;

  if (firstLayout !== undefined) {
    return {
      name: firstLayout,
      type: "layout",
    };
  }

  return undefined;
}

function formatOpenTab(value: unknown): string {
  if (!isJsonObject(value)) {
    return "<invalid-tab>";
  }

  const name = typeof value.name === "string" ? value.name : "<unnamed>";
  const type = typeof value.type === "string" ? value.type : "<unknown-type>";
  return `${type}:${name}`;
}

function isProjectFolder(value: unknown): value is ProjectFolder {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<ProjectFolder>;
  return Array.isArray(candidate.items) && Array.isArray(candidate.subfolders);
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
