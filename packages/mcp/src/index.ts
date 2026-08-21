/**
 * @shipan/mcp — the engine, for agents.
 *
 * The same calculations the CLI and the API expose, described so that a model
 * can use them without producing something plausible and wrong. Two rules do
 * most of that work: a place is looked up rather than guessed, and the
 * current date comes from the server rather than from the model.
 *
 * The third is the project's own: the server returns arrangements and the
 * names and fortunes the tradition attaches to them, and answers no question
 * with them — it ranks nothing and advises nobody.
 */
export { createServer, SERVER_NAME, SERVER_VERSION } from './server.js';
export type { ToolContext } from './shared.js';
