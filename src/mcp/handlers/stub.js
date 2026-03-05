/**
 * stub.js
 *
 * Creates stub handlers for tools that have no real implementation.
 * Returns a structured "not implemented" response that describes
 * what the tool would do, so agents get useful feedback.
 */

/**
 * Create a stub handler for an unimplemented tool.
 *
 * @param {object} toolDef - Tool definition from a skill's tools directory
 * @returns {(params: object) => Promise<{ content: Array<{ type: string, text: string }> }>}
 */
export function createStubHandler(toolDef) {
  return async (params) => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            status: 'not_implemented',
            tool: toolDef.name,
            message: `Tool "${toolDef.name}" is not yet implemented. ${toolDef.description || ''}`,
            when_to_use: toolDef.when_to_use || null,
            received_parameters: params || null,
            expected_return: toolDef.returns || null,
          },
          null,
          2,
        ),
      },
    ],
  });
}
