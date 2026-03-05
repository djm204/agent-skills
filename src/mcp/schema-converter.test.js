import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { convertParametersToZod, convertToolToMcpRegistration } from './schema-converter.js';

// ============================================================================
// convertParametersToZod
// ============================================================================

describe('convertParametersToZod', () => {
  it('returns a Zod object schema', () => {
    const schema = convertParametersToZod({ query: { type: 'string', required: true } });
    expect(schema).toBeDefined();
    expect(schema._def.typeName).toBe('ZodObject');
  });

  it('returns empty z.object({}) for undefined input', () => {
    const schema = convertParametersToZod(undefined);
    expect(schema._def.typeName).toBe('ZodObject');
    // Should accept empty objects
    expect(schema.parse({})).toEqual({});
  });

  it('returns empty z.object({}) for null input', () => {
    const schema = convertParametersToZod(null);
    expect(schema.parse({})).toEqual({});
  });

  // --- Type mapping ---

  it('maps type: string to z.string()', () => {
    const schema = convertParametersToZod({ name: { type: 'string' } });
    expect(() => schema.parse({ name: 'hello' })).not.toThrow();
    expect(() => schema.parse({ name: 123 })).toThrow();
  });

  it('maps type: integer to z.number().int()', () => {
    const schema = convertParametersToZod({ count: { type: 'integer' } });
    expect(() => schema.parse({ count: 5 })).not.toThrow();
    expect(() => schema.parse({ count: 5.5 })).toThrow();
  });

  it('maps type: number to z.number()', () => {
    const schema = convertParametersToZod({ score: { type: 'number' } });
    expect(() => schema.parse({ score: 3.14 })).not.toThrow();
  });

  it('maps type: boolean to z.boolean()', () => {
    const schema = convertParametersToZod({ active: { type: 'boolean' } });
    expect(() => schema.parse({ active: true })).not.toThrow();
    expect(() => schema.parse({ active: 'yes' })).toThrow();
  });

  it('maps type: array to z.array(z.unknown())', () => {
    const schema = convertParametersToZod({ items: { type: 'array' } });
    expect(() => schema.parse({ items: [1, 'two', true] })).not.toThrow();
  });

  it('maps type: object to z.object({}).passthrough()', () => {
    const schema = convertParametersToZod({ data: { type: 'object' } });
    expect(() => schema.parse({ data: { foo: 'bar' } })).not.toThrow();
  });

  it('maps unknown type to z.unknown()', () => {
    const schema = convertParametersToZod({ mystery: { type: 'custom' } });
    expect(() => schema.parse({ mystery: 'anything' })).not.toThrow();
  });

  // --- Enum ---

  it('maps enum field to z.enum()', () => {
    const schema = convertParametersToZod({
      priority: { type: 'string', enum: ['normal', 'high', 'urgent'] },
    });
    expect(() => schema.parse({ priority: 'high' })).not.toThrow();
    expect(() => schema.parse({ priority: 'low' })).toThrow();
  });

  // --- Optionality ---

  it('makes required: true fields non-optional', () => {
    const schema = convertParametersToZod({ query: { type: 'string', required: true } });
    expect(() => schema.parse({})).toThrow();
  });

  it('makes required: false fields optional', () => {
    const schema = convertParametersToZod({ limit: { type: 'integer', required: false } });
    expect(() => schema.parse({})).not.toThrow();
  });

  it('defaults to required when required field is absent', () => {
    const schema = convertParametersToZod({ query: { type: 'string' } });
    expect(() => schema.parse({})).toThrow();
  });

  it('applies default values', () => {
    const schema = convertParametersToZod({
      max_results: { type: 'integer', default: 10, required: false },
    });
    const result = schema.parse({});
    expect(result.max_results).toBe(10);
  });

  it('applies description via .describe()', () => {
    const schema = convertParametersToZod({
      query: { type: 'string', description: 'The search query', required: true },
    });
    // Zod stores descriptions — verify the shape parsed correctly
    expect(schema.parse({ query: 'test' })).toEqual({ query: 'test' });
  });

  // --- Mixed parameters (real tool schemas) ---

  it('handles web_search parameters (required + optional)', () => {
    const schema = convertParametersToZod({
      query: { type: 'string', description: 'The search query', required: true },
      max_results: { type: 'integer', description: 'Maximum results', default: 10 },
    });
    // Only query required
    expect(schema.parse({ query: 'test' })).toEqual({ query: 'test', max_results: 10 });
    // Both provided
    expect(schema.parse({ query: 'test', max_results: 5 })).toEqual({ query: 'test', max_results: 5 });
    // Missing query
    expect(() => schema.parse({})).toThrow();
  });

  it('handles draft_email parameters (mixed types + enum)', () => {
    const schema = convertParametersToZod({
      to: { type: 'array', description: 'Recipients', required: true },
      subject: { type: 'string', description: 'Subject', required: true },
      body: { type: 'string', description: 'Body', required: true },
      cc: { type: 'array', description: 'CC', required: false },
      priority: { type: 'string', description: 'Priority', enum: ['normal', 'high', 'urgent'], required: false },
    });
    const result = schema.parse({
      to: ['alice@example.com'],
      subject: 'Hello',
      body: 'World',
    });
    expect(result.to).toEqual(['alice@example.com']);
    expect(result.cc).toBeUndefined();
    expect(result.priority).toBeUndefined();
  });
});

// ============================================================================
// convertToolToMcpRegistration
// ============================================================================

describe('convertToolToMcpRegistration', () => {
  const toolDef = {
    name: 'web_search',
    description: 'Search the web for information',
    when_to_use: 'When the user asks about current events',
    parameters: {
      query: { type: 'string', description: 'Search query', required: true },
      max_results: { type: 'integer', description: 'Max results', default: 10 },
    },
    returns: { type: 'array' },
  };

  it('returns an object with name, description, and schema', () => {
    const reg = convertToolToMcpRegistration(toolDef);
    expect(reg.name).toBe('web_search');
    expect(reg.description).toBe('Search the web for information');
    expect(reg.schema).toBeDefined();
  });

  it('schema is a valid Zod object schema', () => {
    const reg = convertToolToMcpRegistration(toolDef);
    expect(reg.schema._def.typeName).toBe('ZodObject');
    expect(() => reg.schema.parse({ query: 'test' })).not.toThrow();
  });

  it('handles tool with no parameters', () => {
    const reg = convertToolToMcpRegistration({
      name: 'get_status',
      description: 'Get system status',
    });
    expect(reg.name).toBe('get_status');
    expect(reg.schema.parse({})).toEqual({});
  });
});
