# Contributing

Thanks for taking an interest. This is a small project, so the process is light.

## Getting set up

You need Node 20 or newer.

```sh
npm install
npm run dev
```

That serves the app on <http://localhost:5174>. The 3D world is at `/#world`,
or you can reach it from the portal's "Enter the 3D World" button.

## Branching

| Branch      | Purpose                                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`      | Stable. Only ever receives merges from `release/*` or `fix/*`, and every commit on it is a tagged release.                                                 |
| `develop`   | Integration. Everything lands here first and is expected to stay green.                                                                                    |
| `feature/*` | New features. Branch from `develop`, merge back into `develop`.                                                                                            |
| `fix/*`     | Bug fixes. Branch from `develop`; branch from `main` only for an urgent fix to a released version, and then merge into both.                               |
| `release/*` | Release preparation only — version bump, changelog, last stabilising fixes. Branch from `develop`, merge into `main`, tag, then merge back into `develop`. |

Name branches after what they do: `feature/kollam-region`,
`fix/canoe-drift-on-bank`, `release/0.2.0`.

Open pull requests against `develop` unless you are fixing something already
released, in which case say so in the description.

## Releasing

Versions follow [Semantic Versioning](https://semver.org). While the project is
below `1.0.0`, a minor bump may break saved progress or world data shapes; that
is called out in the changelog when it happens.

1. `git switch -c release/X.Y.Z develop`
2. Set `version` in `package.json`.
3. Move the `Unreleased` items in `CHANGELOG.md` under a new `[X.Y.Z]` heading
   with today's date, and check the README still describes what actually ships.
4. Run the full checks below.
5. Merge into `main`, then tag: `git tag -a vX.Y.Z -m "vX.Y.Z"`.
6. Merge `main` back into `develop`.
7. Push `main`, `develop` and the tag, then publish the GitHub release using the
   changelog entry as the body.

## Before you open a pull request

Run all three. CI runs the same commands.

```sh
npm run format:check
npm run build
npm test
```

The first time you run the tests you also need the browser:

```sh
npx playwright install chromium
```

## How the tests work

Tests live in `tests/` and run under Playwright against a dev server that
Playwright starts for you. They are a mix of two things:

- **Pure checks** that import the world model directly and assert on it — where
  the collision boxes are, how fast the canoe accelerates, which bus stands are
  unlocked at a given point. These run in milliseconds and are the right place
  for anything about rules or numbers.
- **Browser tests** that drive the real game — walking, discovering, sitting,
  boarding the canoe, fast travel, and whether the soundscape actually makes
  sound.

A note learned the hard way: headless software rendering runs the simulation far
slower than wall-clock time, so **do not assert that the player travels N units
in M seconds**. Either assert on the pure model, or compare two measurements
taken the same way in the same session.

Another: the game writes its own saved journey to `localStorage` when it
unmounts. If a test needs to seed a position, seed it _after_ leaving the world,
not before.

## Code style

Prettier, with its defaults. `npm run format` fixes; `npm run format:check`
verifies. There is no ESLint or type checking configured today — see the issues
list if you would like to add either.

Beyond formatting, the house style is:

- Comments explain _why_, or state a constraint the code cannot show. Skip
  comments that restate the next line.
- Prefer extending the data in `src/game/world.js` over adding new systems.
- Keep the world's voice: understated, specific, never a tourism brochure.

## Adding to the world

Most content changes are data, not code. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for what lives where, and
[docs/CONTENT.md](docs/CONTENT.md) for how to add a place, a rest spot, an
overheard line, or a sound.

## Writing about Kerala

The world is a stylised, fictional Kerala that borrows from real places. When
adding content:

- Name real traditions accurately, and describe them from a respectful
  distance. Theyyam, Pooram and a kavu are living practice, not set dressing.
- Transliterate Malayalam rather than using the script, keep lines short, and
  gloss only when the meaning would otherwise be lost.
- No stereotypes, and no claiming a fictional location is a real one.
