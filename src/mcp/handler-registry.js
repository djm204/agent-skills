/**
 * handler-registry.js
 *
 * Resolves tool handlers with priority: built-in > user-provided > stub.
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { createStubHandler } from './handlers/stub.js';

export class HandlerRegistry {
  #builtins = new Map();
  #userHandlers = new Map();

  /**
   * Register a built-in handler (highest priority).
   * @param {string} name - Tool name
   * @param {Function} handler - Async handler function
   */
  registerBuiltin(name, handler) {
    this.#builtins.set(name, handler);
  }

  /**
   * Register a user-provided handler (middle priority).
   * @param {string} name - Tool name
   * @param {Function} handler - Async handler function
   */
  registerUser(name, handler) {
    this.#userHandlers.set(name, handler);
  }

  /**
   * Resolve the handler for a tool. Priority: built-in > user > stub.
   * @param {string} name - Tool name
   * @param {object} toolDef - Tool definition (used to create stub if needed)
   * @returns {Function} Async handler function
   */
  resolve(name, toolDef) {
    return this.#builtins.get(name) || this.#userHandlers.get(name) || createStubHandler(toolDef);
  }

  /**
   * Load user handlers from a directory of .js files.
   * Each file must export a default async function.
   * The filename (minus .js) becomes the handler name.
   *
   * @param {string} dirPath - Path to handler directory
   */
  async loadHandlersFromDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const entries = fs.readdirSync(dirPath);
    for (const file of entries) {
      if (!file.endsWith('.js')) continue;
      const name = path.basename(file, '.js');
      const fullPath = path.resolve(dirPath, file);
      const module = await import(pathToFileURL(fullPath).href);
      if (typeof module.default === 'function') {
        this.registerUser(name, module.default);
      }
    }
  }
}
