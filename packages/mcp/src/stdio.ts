#!/usr/bin/env node
/**
 * The stdio entry point: how a local MCP client — Claude Code, an IDE, a
 * script — starts the server as a subprocess.
 *
 * On stdio the standard output belongs to the protocol. Any diagnostic goes
 * to stderr; a stray line on stdout corrupts the JSON-RPC stream and the
 * client sees a server that hung.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import type { ToolContext } from './shared.js';

const context: ToolContext = {};
if (process.env['GEONAMES_DB_PATH']) context.databasePath = process.env['GEONAMES_DB_PATH'];
if (process.env['SE_EPHE_PATH']) context.ephemerisPath = process.env['SE_EPHE_PATH'];

const server = createServer(context);
await server.connect(new StdioServerTransport());
process.stderr.write('qimendunjia MCP listening on stdio\n');
