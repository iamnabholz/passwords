import { passwordWords } from './password-words.ts';

const substitutions: Record<string, readonly string[]> = {
	a: ['4', '@'],
	i: ['1', '!'],
	o: ['0'],
	s: ['5', '$'],
	b: ['8'],
	e: ['3'],
	u: ['4']
};

function randomInt(limit: number): number {
	const buffer = new Uint32Array(1);
	// Reject the uneven remainder so every choice has equal probability.
	const ceiling = 2 ** 32 - (2 ** 32 % limit);
	do {
		globalThis.crypto.getRandomValues(buffer);
	} while (buffer[0] >= ceiling);
	return buffer[0] % limit;
}

function pick<T>(items: readonly T[]): T {
	return items[randomInt(items.length)];
}

function censor(word: string): string {
	const letters = [...word];
	const eligible = letters.flatMap((letter, index) => (substitutions[letter] ? [index] : []));

	// Always modify a letter, but cap changes at two to keep the word recognizable.
	const changes = Math.min(eligible.length, randomInt(2) + 1);
	for (let count = 0; count < changes; count += 1) {
		const [index] = eligible.splice(randomInt(eligible.length), 1);
		letters[index] = pick(substitutions[letters[index]]);
	}
	return letters.join('');
}

/**
 * Exceeds NIST SP 800-63B-4's 15-character single-factor minimum.
 * The random tail adds unpredictability independently of the joke words and leetspeak.
 * This is not NIST certification or a substitute for the verifier's breach blocklist.
 */
export function generatePassword(): string {
	const available = [...passwordWords];
	const phrase = Array.from({ length: 2 }, () => {
		const [word] = available.splice(randomInt(available.length), 1);
		return censor(word);
	}).join('-');

	return phrase;
}
