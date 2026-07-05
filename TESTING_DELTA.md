# Testing Delta & Verification Plan

## Current Verification State
- **Lint Verification**: Succeeded cleanly using `npm run lint` (`tsc --noEmit`), confirming absolute TypeScript type alignment across all views, data schemas, and helper methods.
- **Production Build Verification**: Succeeded cleanly via `npm run build`, producing an optimized static web asset payload in `dist/` and a bundled production-ready CJS server entry file (`dist/server.cjs`).
- **Static Coverage**: There are currently no pre-configured unit-testing suites (such as Vitest or Jest) inside `package.json`.

## Proposed Testing Delta (Core Requirements)

### 1. Precursor Calculation Core Unit Tests
- **Objective**: Ensure that the mathematical difference between alarm timestamps and stop start-times is calculated correctly, handles positive differences, and ignores post-stoppage alarms.
- **Test Scenarios**:
  * **Test Scenario A**: Alarm occurs exactly 119 seconds before a production stop. Verify it falls into `< 2m`, `< 5m`, and `< 10m` lists.
  * **Test Scenario B**: Alarm occurs exactly 121 seconds before. Verify it falls into `< 5m` and `< 10m` lists, but *not* the `< 2m` list.
  * **Test Scenario C**: Alarm occurs 1 second after the stop. Verify it is excluded from all precursor categories.

### 2. CSV Parser Parser Robustness Tests
- **Objective**: Ensure CSV parser tolerates malformed logs, missing trailing commas, and scrambled header cases.
- **Test Scenarios**:
  * Upload log with headers missing (rely on index fallback mapping).
  * Upload empty file (verify error toast displays, no crash).
  * Upload massive file (verify memory boundaries on heap).

### 3. Server Route API Tests
- **Objective**: Verify that the `/api/analyze` route returns correct 400 structures when the API key is missing and correctly parses generated structured JSON block.
- **Test Scenarios**:
  * Call `/api/analyze` with empty arrays (should handle empty streams gracefully).
  * Call with API Key undefined (expect clear 400 response with configuration setup guide).
