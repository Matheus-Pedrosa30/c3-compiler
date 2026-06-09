import {
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export interface AtomicJsonWriteOptions {
  readonly backupExisting?: boolean;
  readonly backupExtension?: string;
  readonly tempExtension?: string;
}

export interface AtomicJsonWriteResult {
  readonly filePath: string;
  readonly tempFilePath: string;
  readonly backupFilePath?: string;
}

export class AtomicWriteError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AtomicWriteError";
  }
}

export function atomicWriteJsonFile(
  filePath: string,
  jsonText: string,
  options: AtomicJsonWriteOptions = {},
): AtomicJsonWriteResult {
  const normalizedFilePath = path.resolve(filePath);
  const directory = path.dirname(normalizedFilePath);
  const tempFilePath = createTempFilePath(
    normalizedFilePath,
    options.tempExtension,
  );
  const backupFilePath =
    options.backupExisting === true && existsSync(normalizedFilePath)
      ? `${normalizedFilePath}${options.backupExtension ?? ".bak"}`
      : undefined;

  try {
    mkdirSync(directory, { recursive: true });
    writeFileSync(tempFilePath, jsonText, { encoding: "utf8", flag: "w" });
    fsyncFile(tempFilePath);
    validateWrittenJson(tempFilePath);

    if (backupFilePath !== undefined) {
      copyFileSync(normalizedFilePath, backupFilePath);
      fsyncFile(backupFilePath);
    }

    renameSync(tempFilePath, normalizedFilePath);
    fsyncDirectory(directory);

    return {
      filePath: normalizedFilePath,
      tempFilePath,
      ...(backupFilePath === undefined ? {} : { backupFilePath }),
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);

    throw new AtomicWriteError(
      `Failed to atomically write JSON file ${normalizedFilePath}: ${detail}`,
      { cause: error },
    );
  }
}

function createTempFilePath(filePath: string, tempExtension?: string): string {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, `${parsed.name}${tempExtension ?? ".tmp.json"}`);
}

function validateWrittenJson(filePath: string): void {
  const stats = statSync(filePath);

  if (!stats.isFile() || stats.size === 0) {
    throw new AtomicWriteError(
      `Temporary JSON file ${filePath} was not written correctly.`,
    );
  }

  JSON.parse(readFileSync(filePath, "utf8")) as unknown;
}

function fsyncFile(filePath: string): void {
  const fileDescriptor = openSync(filePath, "r");

  try {
    fsyncSync(fileDescriptor);
  } finally {
    closeSync(fileDescriptor);
  }
}

function fsyncDirectory(directory: string): void {
  let fileDescriptor: number | undefined;

  try {
    fileDescriptor = openSync(directory, "r");
    fsyncSync(fileDescriptor);
  } catch {
    // Some platforms do not allow fsync on directories. The atomic rename has
    // already happened, so this is a best-effort durability step.
  } finally {
    if (fileDescriptor !== undefined) {
      closeSync(fileDescriptor);
    }
  }
}
