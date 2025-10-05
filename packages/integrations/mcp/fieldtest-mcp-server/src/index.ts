#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 * - Summarizing all notes via a prompt
 */

import path from "path";
import {
	CallToolRequestSchema,
	type GetPromptRequest,
	GetPromptRequestSchema,
	GetPromptResponse,
	ListPromptsRequestSchema,
	ListResourcesRequestSchema,
	ListResourcesResponse,
	ListToolsRequestSchema,
	ListToolsResponse,
	type ReadResourceRequest,
	ReadResourceRequestSchema,
	Server,
	StdioServerTransport,
} from "@modelcontextprotocol/sdk";
import * as fieldtestOps from "./fieldtestOperations.js";

// Define a more specific type for the request object in CallToolRequestSchema handler
interface FieldTestToolArguments {
	directory?: string;
	dryRun?: boolean;
	filePath?: string;
	changes?: Array<{
		filePath: string;
		newPath?: string;
		frontmatterUpdates?: any;
		changelogEntry?: string;
	}>;
	baseDirectory?: string;
	title?: string; // For create_note
	content?: string; // For create_note
}

interface FieldTestCallToolRequestParams {
	name: string;
	arguments?: FieldTestToolArguments;
}

interface FieldTestCustomCallToolRequest {
	params: FieldTestCallToolRequestParams;
	id?: string | number | null;
	jsonrpc?: "2.0";
}

/**
 * Type alias for a note object.
 */
type Note = { title: string; content: string };

/**
 * Simple in-memory storage for notes.
 * In a real implementation, this would likely be backed by a database.
 */
const notes: { [id: string]: Note } = {
	"1": { title: "First Note", content: "This is note 1" },
	"2": { title: "Second Note", content: "This is note 2" },
};

/**
 * Create an MCP server with capabilities for resources (to list/read notes),
 * tools (to create new notes), and prompts (to summarize notes).
 */
const server = new Server(
	{
		name: "FieldTest MCP Server",
		version: "0.1.0",
	},
	{
		capabilities: {
			resources: {},
			tools: {},
			prompts: {},
		},
	},
);

/**
 * Handler for listing available notes as resources.
 * Each note is exposed as a resource with:
 * - A note:// URI scheme
 * - Plain text MIME type
 * - Human readable name and description (now including the note title)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
	return {
		resources: Object.entries(notes).map(([id, note]) => ({
			uri: `note:///${id}`,
			mimeType: "text/plain",
			name: note.title,
			description: `A text note: ${note.title}`,
		})),
	};
});

/**
 * Handler for reading the contents of a specific note.
 * Takes a note:// URI and returns the note content as plain text.
 */
server.setRequestHandler(
	ReadResourceRequestSchema,
	async (request: ReadResourceRequest) => {
		const url = new URL(request.params.uri);
		const id = url.pathname.replace(/^\//, "");
		const note = notes[id];

		if (!note) {
			throw new Error(`Note ${id} not found`);
		}

		return {
			contents: [
				{
					uri: request.params.uri,
					mimeType: "text/plain",
					text: note.content,
				},
			],
		};
	},
);

/**
 * Handler that lists available tools.
 * Exposes a single "create_note" tool that lets clients create new notes.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: "create_note",
				description: "Create a new note",
				inputSchema: {
					type: "object",
					properties: {
						title: {
							type: "string",
							description: "Title of the note",
						},
						content: {
							type: "string",
							description: "Text content of the note",
						},
					},
					required: ["title", "content"],
				},
			},
			{
				name: "organize_documents",
				description:
					"Scans, validates, classifies, and organizes Markdown documents in a directory.",
				inputSchema: {
					type: "object",
					properties: {
						directory: {
							type: "string",
							description:
								"The absolute path to the directory to organize (e.g., D:\\Work\\docs).",
						},
						dryRun: {
							type: "boolean",
							description: "If true, proposes changes without applying them.",
							default: true,
						},
					},
					required: ["directory"],
				},
			},
			{
				name: "get_document_details",
				description:
					"Retrieves frontmatter and validation status for a specific Markdown file.",
				inputSchema: {
					type: "object",
					properties: {
						filePath: {
							type: "string",
							description: "The absolute path to the Markdown file.",
						},
					},
					required: ["filePath"],
				},
			},
			{
				name: "apply_document_changes",
				description:
					"Applies a set of proposed changes to documents (file moves, frontmatter updates).",
				inputSchema: {
					type: "object",
					properties: {
						changes: {
							type: "array",
							items: {
								type: "object",
								properties: {
									filePath: { type: "string" },
									newPath: { type: "string" },
									frontmatterUpdates: { type: "object" },
									changelogEntry: { type: "string" },
								},
								required: ["filePath"],
							},
							description: "An array of changes to apply.",
						},
						baseDirectory: {
							type: "string",
							description:
								"The root directory for docs, used for changelog/index updates (e.g., D:\\Work\\docs).",
						},
					},
					required: ["changes", "baseDirectory"],
				},
			},
		],
	};
});

/**
 * Handler for the create_note tool.
 * Creates a new note with the provided title and content, and returns success message.
 */
server.setRequestHandler(
	CallToolRequestSchema,
	async (request: FieldTestCustomCallToolRequest) => {
		switch (request.params.name) {
			case "create_note": {
				const title = String(request.params.arguments?.title);
				const content = String(request.params.arguments?.content);
				if (!title || !content) {
					throw new Error("Title and content are required");
				}

				const id = String(Object.keys(notes).length + 1);
				notes[id] = { title, content };

				return {
					content: [
						{
							type: "text",
							text: `Created note ${id}: ${title}`,
						},
					],
				};
			}

			case "get_document_details": {
				const filePath = request.params.arguments?.filePath;
				if (!filePath) {
					throw new Error(
						"filePath parameter is required for get_document_details.",
					);
				}
				try {
					const frontmatter = await fieldtestOps.readFrontmatter(filePath);
					const validationResult =
						await fieldtestOps.validateFrontmatter(frontmatter);
					return {
						content: [
							{
								type: "json",
								json: {
									filePath,
									frontmatter,
									validation: validationResult,
								},
							},
						],
					};
				} catch (error: any) {
					return {
						content: [
							{
								type: "text",
								text: `Error getting document details for ${filePath}: ${error.message}`,
							},
						],
					};
				}
			}

			case "organize_documents": {
				const directory = request.params.arguments?.directory;
				const dryRun =
					request.params.arguments?.dryRun !== undefined
						? Boolean(request.params.arguments.dryRun)
						: true;

				if (!directory) {
					throw new Error(
						"Directory parameter is required for organize_documents.",
					);
				}

				try {
					const allFiles = await fieldtestOps.scanFiles(directory);
					const proposedChanges: Array<any> = [];
					let operationsLog = "Organization Process Log:\n";
					operationsLog += `Scanning directory: ${directory}\n`;
					operationsLog += `Found ${allFiles.length} Markdown files.\n`;

					for (const filePath of allFiles) {
						operationsLog += `\nProcessing: ${filePath}\n`;
						const originalPath = filePath;
						const currentPath = filePath;
						const frontmatter = await fieldtestOps.readFrontmatter(currentPath);
						const validation =
							await fieldtestOps.validateFrontmatter(frontmatter);

						operationsLog += `  Validation: ${validation.isValid ? "Valid" : "Invalid (" + (validation.errors?.join(", ") || "unknown error") + ")"}\n`;

						let frontmatterUpdates: any = {};
						let newPath = currentPath;
						const changelogEntryParts: string[] = [];

						const duplicateOf = await fieldtestOps.findDuplicates(
							currentPath,
							allFiles,
							frontmatter,
						);
						if (
							duplicateOf &&
							!frontmatter.archived &&
							!frontmatter.duplicate
						) {
							operationsLog += `  Action: Marked as duplicate of ${duplicateOf}. Will be moved to archive.\n`;
							const archiveResult = await fieldtestOps.archiveFile(
								currentPath,
								directory,
								{ duplicate: true },
							);
							newPath = archiveResult.newPath;
							frontmatterUpdates = {
								...frontmatterUpdates,
								...archiveResult.frontmatterUpdates,
								duplicateOf,
							};
							changelogEntryParts.push(
								`Marked ${path.basename(originalPath)} as duplicate of ${path.basename(duplicateOf)} and moved to archive.`,
							);
						} else if (
							fieldtestOps.isStale(frontmatter) &&
							!frontmatter.archived &&
							!frontmatter.duplicate
						) {
							operationsLog += `  Action: Marked as stale. Will be moved to archive.\n`;
							const archiveResult = await fieldtestOps.archiveFile(
								currentPath,
								directory,
								{ archived: true },
							);
							newPath = archiveResult.newPath;
							frontmatterUpdates = {
								...frontmatterUpdates,
								...archiveResult.frontmatterUpdates,
							};
							changelogEntryParts.push(
								`Marked ${path.basename(originalPath)} as stale and moved to archive.`,
							);
						}

						if (!frontmatterUpdates.archived && !frontmatterUpdates.duplicate) {
							const classification =
								await fieldtestOps.classifyDocument(frontmatter);
							operationsLog += `  Classification: Type - ${classification.type || "N/A"}, Category - ${classification.category || "N/A"}\n`;

							if (!classification.type || !classification.category) {
								operationsLog += `  Action: Document type or category missing. Needs review. Kept at ${currentPath}\n`;
								if (!frontmatter.type && !frontmatter.category) {
									frontmatterUpdates.tags = [
										...(frontmatter.tags || []),
										"needs_review",
									];
									changelogEntryParts.push(
										`Flagged ${path.basename(originalPath)} as 'needs_review' due to missing type/category.`,
									);
								}
							} else {
								const targetPath = fieldtestOps.determineTargetPath(
									currentPath,
									classification,
									directory,
									{ ...frontmatter, ...frontmatterUpdates },
								);
								if (targetPath !== currentPath) {
									newPath = targetPath;
									operationsLog += `  Action: To be moved from ${currentPath} to ${newPath}\n`;
									changelogEntryParts.push(
										`Moved ${path.basename(originalPath)} from ${path.relative(directory, currentPath) || "."} to ${path.relative(directory, newPath)} based on classification (Type: ${classification.type}, Category: ${classification.category}).`,
									);
								} else {
									operationsLog += `  Action: Correctly placed according to classification. Stays at ${currentPath}\n`;
								}
							}
						}

						if (
							newPath !== originalPath ||
							Object.keys(frontmatterUpdates).length > 0
						) {
							proposedChanges.push({
								filePath: originalPath,
								newPath: newPath !== originalPath ? newPath : undefined,
								frontmatterUpdates:
									Object.keys(frontmatterUpdates).length > 0
										? frontmatterUpdates
										: undefined,
								changelogEntry: changelogEntryParts.join(" "),
							});
						}
					}

					operationsLog += "\nProposed Changes:\n";
					if (proposedChanges.length === 0) {
						operationsLog += "No changes proposed.\n";
					} else {
						proposedChanges.forEach((change) => {
							operationsLog += `- File: ${change.filePath}\n`;
							if (change.newPath)
								operationsLog += `  Move to: ${change.newPath}\n`;
							if (change.frontmatterUpdates)
								operationsLog += `  Update Frontmatter: ${JSON.stringify(change.frontmatterUpdates)}\n`;
							if (change.changelogEntry)
								operationsLog += `  Changelog: ${change.changelogEntry}\n`;
						});
					}

					if (!dryRun && proposedChanges.length > 0) {
						operationsLog += "\n\nApplying changes (dryRun=false)...\n";
						for (const change of proposedChanges) {
							let currentProcessingPath = change.filePath;
							if (change.frontmatterUpdates) {
								await fieldtestOps.updateFrontmatter(
									currentProcessingPath,
									change.frontmatterUpdates,
								);
								operationsLog += `  Applied frontmatter updates to ${currentProcessingPath}\n`;
							}
							if (change.newPath) {
								await fieldtestOps.moveFile(
									currentProcessingPath,
									change.newPath,
								);
								operationsLog += `  Moved ${currentProcessingPath} to ${change.newPath}\n`;
								currentProcessingPath = change.newPath;
							}
							if (change.changelogEntry) {
								await fieldtestOps.updateChangelog(
									directory,
									change.changelogEntry,
								);
							}
						}
						await fieldtestOps.updateIndex(directory);
						operationsLog += "All changes applied and index updated.\n";

						return {
							content: [
								{
									type: "text",
									text: `Organization process completed for ${directory}.\n${operationsLog}`,
								},
							],
						};
					} else {
						return {
							content: [
								{
									type: "text",
									text: `Dry run completed for ${directory}. Review proposed changes.\n${operationsLog}`,
								},
								...(proposedChanges.length > 0
									? [
											{
												type: "json" as const,
												json: {
													message:
														"Proposed changes (call apply_document_changes to execute):",
													changes: proposedChanges,
													baseDirectory: directory,
												},
											},
										]
									: []),
							],
						};
					}
				} catch (error: any) {
					return {
						content: [
							{
								type: "text",
								text: `Error organizing documents in ${directory}: ${error.message}\n${error.stack}`,
							},
						],
					};
				}
			}

			case "apply_document_changes": {
				const changes = request.params.arguments?.changes;
				const baseDirectory = request.params.arguments?.baseDirectory;

				if (!changes || !baseDirectory) {
					throw new Error(
						"`changes` and `baseDirectory` parameters are required.",
					);
				}
				let applyLog = "Applying Document Changes:\n";
				try {
					for (const change of changes) {
						let currentFilePath = change.filePath;
						applyLog += `Processing change for original file: ${currentFilePath}\n`;

						if (
							change.frontmatterUpdates &&
							Object.keys(change.frontmatterUpdates).length > 0
						) {
							await fieldtestOps.updateFrontmatter(
								currentFilePath,
								change.frontmatterUpdates,
							);
							applyLog += `  Applied frontmatter updates: ${JSON.stringify(change.frontmatterUpdates)}\n`;
						}
						if (change.newPath && change.newPath !== currentFilePath) {
							await fieldtestOps.moveFile(currentFilePath, change.newPath);
							applyLog += `  Moved file to: ${change.newPath}\n`;
							currentFilePath = change.newPath;
						}
						if (change.changelogEntry) {
							await fieldtestOps.updateChangelog(
								baseDirectory,
								change.changelogEntry,
							);
							applyLog += `  Added changelog entry: ${change.changelogEntry}\n`;
						}
					}
					await fieldtestOps.updateIndex(baseDirectory);
					applyLog += "All changes applied. Index updated.\n";
					return {
						content: [{ type: "text", text: applyLog }],
					};
				} catch (error: any) {
					return {
						content: [
							{
								type: "text",
								text: `Error applying changes: ${error.message}\n${applyLog}\n${error.stack}`,
							},
						],
					};
				}
			}

			default:
				throw new Error("Unknown tool");
		}
	},
);

/**
 * Handler that lists available prompts.
 * Exposes a single "summarize_notes" prompt that summarizes all notes.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
	return {
		prompts: [
			{
				name: "summarize_notes",
				description: "Summarize all notes",
			},
		],
	};
});

/**
 * Handler for the summarize_notes prompt.
 * Returns a prompt that requests summarization of all notes, with the notes' contents embedded as resources.
 */
server.setRequestHandler(
	GetPromptRequestSchema,
	async (request: GetPromptRequest) => {
		if (request.params.name !== "summarize_notes") {
			throw new Error("Unknown prompt");
		}

		const embeddedNotes = Object.entries(notes).map(([id, note]) => ({
			type: "resource" as const,
			resource: {
				uri: `note:///${id}`,
				mimeType: "text/plain",
				text: note.content,
			},
		}));

		return {
			messages: [
				{
					role: "user",
					content: {
						type: "text",
						text: "Please summarize the following notes:",
					},
				},
				...embeddedNotes.map((note) => ({
					role: "user" as const,
					content: note,
				})),
				{
					role: "user",
					content: {
						type: "text",
						text: "Provide a concise summary of all the notes above.",
					},
				},
			],
		};
	},
);

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Server error:", error);
	process.exit(1);
});
