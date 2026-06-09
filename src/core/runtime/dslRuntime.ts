import vm from "node:vm";
import type { IrFactory } from "../ir/irFactory.js";
import type { SheetIr } from "../ir/irTypes.js";
import { createDslSandbox } from "./dslSandbox.js";

export interface DslRuntimeOptions {
  readonly filename?: string;
  readonly timeoutMs?: number;
  readonly globals?: Record<string, unknown>;
}

export class DslRuntimeError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DslRuntimeError";
  }
}

export class DslRuntime {
  readonly #irFactory: IrFactory;
  readonly #timeoutMs: number;

  constructor(irFactory: IrFactory, options: DslRuntimeOptions = {}) {
    this.#irFactory = irFactory;
    this.#timeoutMs = options.timeoutMs ?? 1_000;
  }

  execute(source: string, options: DslRuntimeOptions = {}): readonly SheetIr[] {
    const sheets: SheetIr[] = [];
    const sandbox = createDslSandbox(this.#irFactory, (sheet) => {
      sheets.push(sheet);
    }, options.globals);
    const script = new vm.Script(source, {
      filename: options.filename ?? "anonymous.c3dsl.js",
    });

    try {
      script.runInContext(sandbox.context, {
        timeout: options.timeoutMs ?? this.#timeoutMs,
      });
    } catch (error) {
      throw new DslRuntimeError(formatRuntimeError(error), {
        cause: error,
      });
    }

    if (sheets.length === 0) {
      throw new DslRuntimeError(
        "DSL script did not declare any sheet(...). Compilation aborted before writing any generated files.",
      );
    }

    return sheets;
  }
}

export function executeDslScript(
  source: string,
  irFactory: IrFactory,
  options?: DslRuntimeOptions,
): readonly SheetIr[] {
  return new DslRuntime(irFactory, options).execute(source, options);
}

function formatRuntimeError(error: unknown): string {
  if (error instanceof Error) {
    return [
      `DSL execution failed: ${error.message}`,
      "Compilation aborted before writing any generated files.",
    ].join(" ");
  }

  return [
    `DSL execution failed: ${String(error)}`,
    "Compilation aborted before writing any generated files.",
  ].join(" ");
}
