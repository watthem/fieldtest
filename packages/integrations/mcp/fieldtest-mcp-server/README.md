# FieldTest MCP Server

> Model Context Protocol (MCP) server for FieldTest content validation and organization.

The FieldTest MCP Server enables AI assistants to validate and organize content using flat-file indices and Standard Schema. Perfect for dev teams, technical writers, and AI-powered workflows that require structured content validation.

## Features

- ✅ **Content Validation** — Validate markdown files against Standard Schema
- ✅ **Schema Management** — Load and manage validation schemas
- ✅ **Flat-file Indexing** — No vendor lock-in, no data loss
- ✅ **MCP Protocol** — Standardized AI assistant integration
- ✅ **Open Source** — Fork, run, and contribute on GitHub

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io) allows AI assistants like Claude to interact with external tools and data sources. This server exposes FieldTest's validation capabilities through the MCP interface.

## MCP Capabilities

### Resources

- Access content files via URIs
- Retrieve validation schemas
- List available schemas from registry

### Tools

- `validate_content` - Validate markdown content against a schema
- `load_schema` - Load a validation schema
- `list_schemas` - List available schemas

### Prompts

- `validate_project` - Generate validation report for a project
- `suggest_schema` - Suggest schema improvements based on content

## Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

## Installation

### With Claude Desktop

Add the server configuration:

**MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "fieldtest": {
      "command": "node",
      "args": ["/path/to/fieldtest/packages/integrations/mcp/fieldtest-mcp-server/build/index.js"]
    }
  }
}
```

### With Other MCP Clients

The server can be used with any MCP-compatible client. See the [MCP documentation](https://modelcontextprotocol.io) for integration details.

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
