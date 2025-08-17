
# Fieldtest Registry

The Fieldtest Registry is a collection of schemas for common content types.

## Running the Standard Schema Example

To run the Standard Schema example in this package, use the following commands from this directory:

```powershell
# Compile the example to CommonJS JavaScript
tsc standard-schema.example.ts --module commonjs --esModuleInterop --outDir dist

# Run the compiled JavaScript with Node.js
node dist/standard-schema.example.js
```

You should see output like:

```json
Success: hello world
Expected failure: Error: [
  {
    "message": "Must be a string"
  }
]
```

> Note: Directly running the example with ts-node may fail due to ESM/CommonJS module system conflicts. Compiling first is the most reliable approach.

## Running All Examples Easily

To run all Standard Schema example files and see a summary of results, use:

```powershell
# Compile the runner script and run it
# (from this directory)
tsc run-examples.ts --module commonjs --esModuleInterop --outDir dist
node dist/run-examples.js
```

You'll see colorized output for each example and a summary at the end, e.g.:

```log
[SUCCESS] standard-schema.example.ts
[SUCCESS] standard-schema-async.example.ts
[SUCCESS] standard-schema-missing-types.example.ts
[SUCCESS] standard-schema-bad-result.example.ts

Summary: 4 passed, 0 failed
```

> This is the easiest way to check all example behaviors at once!
