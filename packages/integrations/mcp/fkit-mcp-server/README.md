# Fieldtest MCP Server — Organize, Validate, and Collaborate on Docs

> [info] **Now open for early feedback!**

The Fieldtest MCP Server lets anyone validate and organize docs using flat-file indices and the Standard Schema. Perfect for dev teams, technical writers, and LLM explorers who want transparency, structure, and no data loss.

**Features:**

- ✅ Flat-file indexing — No vendor lock-in, no data loss
- ✅ Schema validation and consistency checks
- ✅ Public MCP protocol for collaborative AI workflows
- ✅ Built for builders: Fork, run, contribute on GitHub

[👉 See it on GitHub](https://github.com/westmarkdev/fieldtest-mcp-server)

---

*Building in public?*  
Follow along on [Twitter](https://twitter.com/westmarkdev) | [LinkedIn](https://linkedin.com/in/matthew-scott-hendricks)  
Questions? [Email me](mailto:matthew@westmark.dev) for early access or to collaborate!

## Development

The Fieldtest MCP server to let anyone validate and organize their docs using flat-file indices and standard schema.

This is a TypeScript-based MCP server that implements a simple notes system. It demonstrates core MCP concepts by providing:

- Resources representing text notes with URIs and metadata
- Tools for creating new notes
- Prompts for generating summaries of notes

## Features

### Resources

- List and access notes via `note://` URIs
- Each note has a title, content and metadata
- Plain text mime type for simple content access

### Tools

- `create_note` - Create new text notes
  - Takes title and content as required parameters
  - Stores note in server state

### Prompts

- `summarize_notes` - Generate a summary of all stored notes
  - Includes all note contents as embedded resources
  - Returns structured prompt for LLM summarization

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

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "Fieldtest MCP Server": {
      "command": "/path/to/Fieldtest MCP Server/build/index.js"
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
