# External Architecture Research V1 — PHASE 11.12

Verified independently (WebFetch/WebSearch against primary/authoritative sources this Run), not
cargo-culted. For each: what problem it solves, which PHASE 11.11 failure it maps to, what part
fits, what part does not fit, and adopt/adapt/reject.

## A. Alistair Cockburn — Hexagonal Architecture / Ports & Adapters

Source: https://alistair.cockburn.us/hexagonal-architecture/ (fetched this Run).

**What it solves:** "the entanglement between the business logic and the interaction with external
entities" — business logic infiltrating UI/DB code, which blocks automated testing and headless
operation. The core communicates over symmetric ports to external adapters; **driving** adapters
(tests, UIs) initiate behavior, **driven** adapters (DBs, services) are queried by it. The core
"shouldn't know whether a request comes from a human, automated test, or batch script."

**Maps to:** the entire PHASE 11.11 failure class. `ActionContractV2` (the "core") has no way to
distinguish a request/action authored for a human player from one authored to satisfy a test
assertion — both are the same shape, both get composed into the same UI the same way.

**What fits:** the core distinction itself — driving adapters (real UI, test harness) should be
symmetric consumers of the same core, and the core should not carry logic that only makes sense to
one of them. `testProbes.ts`'s `invokeTestProbe` is a driving-test-adapter in Cockburn's sense: it
calls the same `buildYoheiPacket`/language-port surface the real UI calls, without going through UI
composition.

**What does not fit:** this repo's "core" (Action Contract V2 engine) is itself an isolated research
prototype, not a stable application core with a settled port boundary — introducing a full literal
hexagon (explicit Port interfaces, dependency-inverted adapter registration) for one small scene
would be disproportionate scaffolding for a route that may not survive to become canonical NEW LIFE.

**Adopt/adapt/reject: ADAPT.** Took the driving-adapter symmetry principle (test and UI both drive
the same underlying operations) without adopting full hexagonal ceremony (no new Port interfaces,
no DI container). Realized minimally as `testProbes.ts` + `productSurface.ts`'s composition gate.

## B. Playwright — Test Isolation / Fixtures

Source: https://playwright.dev/docs/test-fixtures (fetched this Run).

**What it solves:** fixtures scope test-only setup ("isolated page for this test run", "isolated
context for this test run") to the test's own execution context, never touching the application
under test directly, and are on-demand — "Playwright Test will setup only the ones needed by your
test and nothing else."

**Maps to:** item D in the problem statement (research questions/actions flattened into the
product's own action menu) and the `ASK_WEATHER_SCENE` leak specifically — a fixture-shaped concern
(does the language layer honor UNKNOWN?) was not isolated to the test's own context; it was wired
into the exact same registry the product UI reads from.

**What fits:** "setup only what's needed by the test, in the test's own scope" maps directly onto
`invokeTestProbe` — the probe's packet-construction happens inline in the test/harness call, never
persisted into `ContractV2State` or exposed to a UI component.

**What does not fit:** this is a browser-automation fixture system (`test.extend()`, worker/test
scoping, teardown) built for Playwright's own runner. There is no literal fixture registration
mechanism to adopt into a Vitest+React unit-level scene; the *vocabulary and scoping principle*
transfers, the *API* does not.

**Adopt/adapt/reject: ADAPT.** Took the scoping principle only.

## C. Vite — `import.meta.env.DEV`/`PROD` and compile-time replacement

Source: https://vite.dev/guide/env-and-mode (fetched this Run).

**What it solves:** Vite "statically replaces" `import.meta.env.DEV`/`PROD` with literal
`true`/`false` at build time, so bundlers tree-shake `if (import.meta.env.DEV) {...}` branches out
of production builds entirely — not merely hide them at runtime.

**Maps to:** item B (Vertex/replay provenance disclosure visible on the primary playable scene).

**What fits:** directly — this repo already uses Vite (`vite.config.ts`), the mechanism is already
available with zero new dependency, and it performs actual compile-time removal, not CSS/JS runtime
hiding (the directive's own explicit requirement, Section 13: "a hidden button that still affects
product state is not solved").

**What does not fit:** nothing identified — this is a precise fit for exactly this leak class.
Caveat recorded honestly: compile-time removal only removes the *rendering* of dev-only content; it
does not, by itself, prevent a dev-only *action* from mutating shared state if that action's handler
were still reachable at runtime through some other path. That residual risk is why the build/mode
boundary (Section C) and the composition boundary (`productSurface.ts`) are treated as two separate,
non-substitutable gates (directive Section 13's own instruction).

**Adopt/adapt/reject: ADOPT**, demonstrated via `devOnlyDisclosure.ts` + `BuildBoundaryDemoApp.tsx`
+ a real `vite build` bundle grep (see `SYSTEMIC_GATES_IMPLEMENTATION_V1.md`).

## D. Unreal Engine — Development vs. Shipping build configurations

Sources: https://dev.epicgames.com/documentation/en-us/unreal-engine/build-configurations-reference-for-unreal-engine
and https://dev.epicgames.com/documentation/unreal-engine/stat-commands-in-unreal-engine (fetched
this Run).

**What it solves:** Development builds "enable all but the most time-consuming... optimizations"
and keep debugging/profiling tools; Shipping "strips out console commands, stats, and profiling
tools" — physically removed from the compiled executable, not merely disabled at runtime.

**Maps to:** the general problem statement (0/1/9/13) — the entire class of instrumentation that is
useful during development but must not reach the shipped/player-facing artifact.

**What fits:** the core distinction between "removed from the binary" vs. "hidden but still
present" is the same distinction Vite's compile-time replacement gives this repo (Section C above)
— confirms the pattern is a recognized, cross-industry norm, not something invented for this audit.

**What does not fit:** Unreal's build-configuration system (Debug/DebugGame/Development/Test/
Shipping, `ALLOW_CONSOLE_IN_SHIPPING`, engine-level compilation flags) is a native-code, multi-target
build pipeline with no equivalent surface area in a Vite/React web app that ships one bundle. There
is no "Shipping configuration" concept to import wholesale.

**Adopt/adapt/reject: ADOPT the principle, REJECT the mechanism.** The principle ("dev tooling
physically absent from the shipped artifact") is already satisfied by adopting Vite's own
compile-time replacement (Section C); no separate Unreal-style build-target system was added.

## E. Martin Fowler / Gerard Meszaros — Test Double vocabulary

Source: https://martinfowler.com/bliki/TestDouble.html (fetched this Run).

**What it solves:** gives a precise vocabulary (Dummy, Fake, Stub, Spy, Mock) for replacing a real
production dependency during a test *without changing the production interaction surface* — the
double stands in for something the production code already depends on; production code is never
edited to expose a test-only branch.

**Maps to:** the meta-question of this whole audit — was `ASK_WEATHER_SCENE` acting as a legitimate
test double for something, or was it a change to the production interaction surface itself? Per
Meszaros's vocabulary, none of the five categories fit what actually happened: `ASK_WEATHER_SCENE`
is not a double substituted in place of a real dependency during a test — it *is* the production
action, authored primarily to give a test something to call. This is the precise, named absence
that this audit's "TEST_AFFORDANCE_LEAK" category exists to describe.

**What fits:** the vocabulary's core discipline — a test's dependency needs are met by substituting
something *around* the production surface, never by adding a new permanent production surface *for*
the test.

**What does not fit:** Fowler/Meszaros's vocabulary describes doubles for *driven* dependencies
(a database, a clock, a payment gateway) called *by* the code under test. `testProbes.ts`'s
`invokeTestProbe` is closer to a driving-test-adapter (Cockburn, Section A) than a classic Test
Double — it is not standing in for a dependency of the scene; it is a second way of driving the same
scene logic. Recorded honestly rather than force-fit.

**Adopt/adapt/reject: ADOPT the vocabulary/discipline as a naming and design-review lens** (used
throughout `RESEARCH_PRODUCT_CONTAMINATION_TRACE_V1.md` and `CONTAMINATION_TAXONOMY_V1.md`); no
code artifact directly implements "a Test Double" per se, since the actual gap was on the driving
side, not the driven side.

## Sources

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) — Alistair Cockburn
- [Test Fixtures](https://playwright.dev/docs/test-fixtures) — Playwright
- [Env Variables and Modes](https://vite.dev/guide/env-and-mode) — Vite
- [Build Configurations Reference for Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/build-configurations-reference-for-unreal-engine) — Epic Games
- [Stat Commands in Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/stat-commands-in-unreal-engine) — Epic Games
- [TestDouble](https://martinfowler.com/bliki/TestDouble.html) — Martin Fowler
