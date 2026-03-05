/**
 * schema-converter.js
 *
 * Converts YAML tool parameter definitions to Zod schemas
 * for MCP SDK tool registration.
 */

import { z } from 'zod';

/**
 * Convert a single YAML parameter definition to a Zod type.
 * @param {object} paramDef - Parameter definition from tools/*.yaml
 * @returns {import('zod').ZodType}
 */
function yamlTypeToZod(paramDef) {
  // enum overrides type
  if (paramDef.enum && Array.isArray(paramDef.enum) && paramDef.enum.length > 0) {
    return z.enum(paramDef.enum.map(String));
  }

  switch (paramDef.type) {
    case 'string':
      return z.string();
    case 'integer':
      return z.number().int();
    case 'number':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'array':
      return z.array(z.unknown());
    case 'object':
      return z.object({}).passthrough();
    default:
      return z.unknown();
  }
}

/**
 * Convert a YAML parameters object to a Zod object schema.
 *
 * @param {object|null|undefined} parameters - Parameters map from tool YAML
 * @returns {import('zod').ZodObject}
 */
export function convertParametersToZod(parameters) {
  if (!parameters) return z.object({});

  const shape = {};

  for (const [key, paramDef] of Object.entries(parameters)) {
    let fieldSchema = yamlTypeToZod(paramDef);

    // Apply description
    if (paramDef.description) {
      fieldSchema = fieldSchema.describe(paramDef.description);
    }

    // Apply default (implies optional)
    if (paramDef.default !== undefined) {
      fieldSchema = fieldSchema.optional().default(paramDef.default);
    } else if (paramDef.required === false) {
      fieldSchema = fieldSchema.optional();
    }

    shape[key] = fieldSchema;
  }

  return z.object(shape);
}

/**
 * Convert a full tool definition to an MCP registration object.
 *
 * @param {object} toolDef - Parsed tool YAML (name, description, parameters, returns)
 * @returns {{ name: string, description: string, schema: import('zod').ZodObject }}
 */
export function convertToolToMcpRegistration(toolDef) {
  return {
    name: toolDef.name,
    description: toolDef.description || '',
    schema: convertParametersToZod(toolDef.parameters),
  };
}
