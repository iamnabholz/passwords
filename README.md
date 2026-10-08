# Bad Password

A client-side novelty password generator with recognizable censored words and cryptographic randomness. Passwords are never saved or sent to an API by this app.

## Password generation and NIST guidance

The generator takes applicable guidance from [NIST SP 800-63B-4, Section 3.1.1](https://pages.nist.gov/800-63-4/sp800-63b.html#passwords). It is **not NIST-certified or a complete NIST-compliant authentication system**.

- Every result exceeds the **15-character minimum** for password-only authentication. NIST permits an eight-character minimum when the password is only used with MFA; this generator does not use that shorter allowance.
- Two different words are randomly selected from the expanded vocabulary in `src/lib/password-words.ts`. Each gets one or two leetspeak substitutions to stay recognizable.
- Joke prefixes, a two- or three-digit number, and a joke suffix are retained. A separate **16-character random tail** is sampled uniformly from 64 ASCII characters. That tail provides 96 bits of randomness by construction, independently of the joke words; this is not a password-strength certification or a NIST-mandated entropy threshold.
- All random selections use `crypto.getRandomValues()` with rejection sampling to avoid modulo bias. There is no `Math.random()` fallback.
- Output stays within 64 characters, uses printable ASCII, wraps without truncation, and can be selected or copied into a password manager. NIST's recommendation that verifiers support **at least 64 characters** is an acceptance rule, not a requirement to generate exactly 64 characters.
- Leetspeak, digits, and symbols are part of the joke, **not required security ingredients**. NIST says verifiers must not impose character-composition rules. The random tail is sampled without forcing uppercase, digits, or symbols to appear.

The site accepting a password must handle full-password checks against common/compromised/context-specific blocklists, secure salted hashing, rate limiting, secure transport, password-manager support, and changes when compromise is detected (not arbitrary periodic resets). This offline generator cannot enforce those rules and does not check breach databases. Dictionary words inside a longer password are not automatically disallowed: NIST calls for checking the **whole password**, not its substrings.

Keep passwords unique per account, do not shorten away the random tail, and use a trusted password manager and MFA or passkeys for important accounts. The visible novelty disclaimer remains intentional.

## Validation

```sh
node --experimental-strip-types --test src/lib/password.test.ts
npm run check
npm run lint
npm run build
```

The generator tests use Node.js with native TypeScript stripping (Node 22.6+).

## Svelte project scaffold

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@1.1.1 create --template minimal --types ts --add prettier eslint --install npm ./
```

## Adding features

Add features to your project with `sv add`:

```sh
npx sv add
```

For example, to add Tailwind CSS:

```sh
npx sv add tailwindcss
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
