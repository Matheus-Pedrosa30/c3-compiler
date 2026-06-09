import { readFileSync } from "node:fs";
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

interface ProjectManifest {
  eventSheets?: ProjectFolder;
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

function requireEventSheetsFolder(manifest: ProjectManifest): ProjectFolder {
  if (!isProjectFolder(manifest.eventSheets)) {
    throw new ConstructProjectWriterError(
      'Invalid project.c3proj: missing "eventSheets" folder tree.',
    );
  }

  return manifest.eventSheets;
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

function isProjectFolder(value: unknown): value is ProjectFolder {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<ProjectFolder>;
  return Array.isArray(candidate.items) && Array.isArray(candidate.subfolders);
}
