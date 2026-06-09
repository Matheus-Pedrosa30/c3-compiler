#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { atomicWriteJsonFile } from "./core/construct/atomicWrite.js";
import { ConstructJsonEmitter } from "./core/construct/constructJsonEmitter.js";
import { readConstructProject } from "./core/construct/constructProjectReader.js";
import { IrFactory } from "./core/ir/irFactory.js";
import { DslRuntime } from "./core/runtime/dslRuntime.js";
import { SidRegistry } from "./core/sid/sidRegistry.js";
import {
  EightDirectionBehavior,
  KeyboardPlugin,
  PlatformBehavior,
  SpriteObject,
  SystemPlugin,
  object,
  use,
} from "./dictionary/index.js";

interface CliArgs {
  readonly input: string;
  readonly project: string;
  readonly output: string;
  readonly backup: boolean;
}

class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}

async function main(argv: readonly string[]): Promise<void> {
  const args = parseArgs(argv);
  const inputPath = path.resolve(args.input);
  const projectRoot = path.resolve(args.project);
  const outputPath = resolveOutputPath(projectRoot, args.output);

  console.log(`c3-compiler: reading Construct project: ${projectRoot}`);
  const projectSnapshot = await readConstructProject(projectRoot);
  console.log(
    `c3-compiler: indexed ${projectSnapshot.objectsByName.size} object(s) and ${projectSnapshot.usedSids.size} SID(s)`,
  );

  const sidRegistry = SidRegistry.fromSids(projectSnapshot.usedSids);
  const irFactory = new IrFactory(projectSnapshot, sidRegistry);
  const runtime = new DslRuntime(irFactory);
  const source = await readFile(inputPath, "utf8");

  console.log(`c3-compiler: executing DSL: ${inputPath}`);
  const sheets = runtime.execute(source, {
    filename: inputPath,
    globals: createDslGlobals(),
  });

  if (sheets.length !== 1) {
    throw new CliError(
      `Expected exactly one sheet(...) in ${inputPath}, but found ${sheets.length}.`,
    );
  }

  const sheet = sheets[0];

  if (sheet === undefined) {
    throw new CliError(`No sheet(...) was produced by ${inputPath}.`);
  }

  const emitter = new ConstructJsonEmitter(sidRegistry);
  const jsonText = emitter.serializeEventSheet(sheet);

  console.log(`c3-compiler: writing event sheet: ${outputPath}`);
  const writeResult = atomicWriteJsonFile(outputPath, jsonText, {
    backupExisting: args.backup,
  });

  console.log(`c3-compiler: wrote ${writeResult.filePath}`);

  if (writeResult.backupFilePath !== undefined) {
    console.log(`c3-compiler: backup ${writeResult.backupFilePath}`);
  }
}

function createDslGlobals(): Record<string, unknown> {
  return {
    object,
    use,
    EightDirectionBehavior,
    KeyboardPlugin,
    PlatformBehavior,
    SpriteObject,
    SystemPlugin,
  };
}

function parseArgs(argv: readonly string[]): CliArgs {
  const values = new Map<string, string>();
  let backup = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === undefined) {
      continue;
    }

    if (arg === "--backup") {
      backup = true;
      continue;
    }

    if (arg === "-i" || arg === "--input") {
      values.set("input", requireValue(argv, index, arg));
      index += 1;
      continue;
    }

    if (arg === "-p" || arg === "--project") {
      values.set("project", requireValue(argv, index, arg));
      index += 1;
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      values.set("output", requireValue(argv, index, arg));
      index += 1;
      continue;
    }

    throw new CliError(`Unknown argument "${arg}".`);
  }

  return {
    input: requireFlag(values, "input", "-i/--input"),
    project: requireFlag(values, "project", "-p/--project"),
    output: requireFlag(values, "output", "-o/--output"),
    backup,
  };
}

function requireValue(
  argv: readonly string[],
  index: number,
  flag: string,
): string {
  const value = argv[index + 1];

  if (value === undefined || value.startsWith("-")) {
    throw new CliError(`Missing value for required flag ${flag}.`);
  }

  return value;
}

function requireFlag(
  values: ReadonlyMap<string, string>,
  key: string,
  flag: string,
): string {
  const value = values.get(key);

  if (value === undefined) {
    throw new CliError(`Missing required argument ${flag}.`);
  }

  return value;
}

function resolveOutputPath(projectRoot: string, output: string): string {
  if (!output.endsWith(".json")) {
    throw new CliError(`Output path must end with .json: ${output}`);
  }

  const outputPath = path.isAbsolute(output)
    ? path.resolve(output)
    : path.resolve(projectRoot, output);
  const relative = path.relative(projectRoot, outputPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new CliError(
      `Output path must stay inside the Construct project: ${output}`,
    );
  }

  return outputPath;
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`c3-compiler: fatal: ${message}`);
  process.exitCode = 1;
});
