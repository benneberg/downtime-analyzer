***Temp***
add following github issues:
Issue 1: Guard user-supplied regular expressions in CSV ingestion
Labels: bug, security, frontend

Description: In src/components/DataTables.tsx, user-defined log cleaning rules instantiate new RegExp(rule.searchPattern, 'g'). If a user provides an invalid regular expression syntax (e.g. unclosed brackets), it can cause an uncaught client-side exception.

Proposed Solution: Wrap pattern compilation in a try / catch block with inline error feedback on the ingestion rule card.

Evidence: src/components/DataTables.tsx regex substitution loop.

Issue 2: Implement automated unit test suite with Vitest
Labels: testing, enhancement

Description: Add vitest and @testing-library/react to package.json to automate regression testing for core analytical math and parsers.

Scope:

Unit tests for precursor time delta calculations in PrecursorDetection.tsx (handling < 2m, < 5m, and < 10m boundary conditions).

Static Hungarian notation linting tests for PlcCodeReview.tsx.

CSV parsing fallback behavior for malformed or missing headers in DataTables.tsx.

Evidence: package.json currently lacks an automated npm test script.

Issue 3: Browser persistence layer (IndexedDB / LocalStorage) for custom datasets
Labels: enhancement, ux

Description: User-uploaded CSV datasets, custom PLC code snippets, and manual event entries reset when the browser tab is hard-refreshed.

Proposed Solution: Implement an optional local persistence sync using localStorage or IndexedDB so that user working sessions persist across reloads without requiring manual JSON file re-importing.

Evidence: State in src/App.tsx is held in React useState hooks with static initialization.