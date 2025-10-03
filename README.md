# DDD made simple workshop materials

Hands-on exercises and examples from the 'DDD made simple' workshop.

## Setup

Install dependencies:
```bash
pnpm install
```

Start mongo in memory:
```bash
pnpm tsx src/utils/mongo-memory-repl-set.ts
```

## Running Tests

Run test watch for 1_student.test.ts:
```bash
pnpm vitest src/1_student.test.ts
```

Run solutions tests:
```bash
pnpm vitest run src/solutions
```

## Music School Sample App

Run the sample app:
```bash
pnpm tsx --watch music-school-sample-app/src/index.ts
```

Run component tests:
```bash
pnpm vitest music-school-sample-app/tests/component.test.ts
```
