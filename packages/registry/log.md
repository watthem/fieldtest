# Example Execution Log

## ✅ Working Approaches

### 1. Compile with tsc, then run with node

- **Command:**

  ```powershell
  tsc standard-schema.example.ts --module commonjs --esModuleInterop --outDir dist
  node dist/standard-schema.example.js
  ```

- **Result:**
  - Success: hello world
  - Expected failure: Error: [ { "message": "Must be a string" } ]
- **Notes:**
  - This approach works reliably regardless of ESM/CJS settings.

### 2. Async Standard Schema validator (compile then run)

- **Command:**

  ```powershell
  tsc standard-schema-async.example.ts --module commonjs --esModuleInterop --outDir dist
  node dist/standard-schema-async.example.js
  ```

- **Result:**
  - Async success: async ok
  - Async expected failure: Error: [ { "message": "Must be a string (async)" } ]
- **Notes:**
  - Async validators work as expected with the compile-then-run approach.

### 3. Schema without 'types' property (compile then run)

- **Command:**

  ```powershell
  tsc standard-schema-missing-types.example.ts --module commonjs --esModuleInterop --outDir dist
  node dist/standard-schema-missing-types.example.js
  ```

- **Result:**
  - No-types success: 123
  - No-types expected failure: Error: [ { "message": "Must be a number" } ]
- **Notes:**
  - Omitting the 'types' property disables type inference, but runtime validation still works as expected.

### 4. Schema returning invalid result (compile then run)

- **Command:**

  ```powershell
  tsc standard-schema-bad-result.example.ts --module commonjs --esModuleInterop --outDir dist
  node dist/standard-schema-bad-result.example.js
  ```

- **Result:**
  - Bad-result should not succeed: undefined
- **Notes:**
  - If the validator returns an object with neither 'value' nor 'issues', the utility returns undefined without error. This exposes a gap in spec enforcement and error handling.

## ❌ Not Working Approaches

### 1. Directly running with ts-node

- **Command:**

  ```powershell
  pnpm exec ts-node standard-schema.example.ts
  ```

- **Result:**
  - Fails with module system errors (ESM/CJS conflict, unknown file extension, or loader issues).
- **Notes:**
  - This approach is unreliable in this monorepo setup due to mixed module systems.

---

(Continue to add more approaches and results below as you try new examples...)
