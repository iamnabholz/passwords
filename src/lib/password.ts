import { passwordWords, passphraseWords } from './password-words.ts';

const substitutions: Record<string, readonly string[]> = {
	a: ['4', '@', '*', '#'],
	// b: ['8'],
	e: ['3', '*', '#'],
	//g: ['9'],
	i: ['1', '!', '*', '#'],
	//l: ['1', '|'],
	o: ['0', '*', '#'],
	//s: ['5', '$'],
	//t: ['7', '+'],
	u: ['4', '*', '#']
};

const censorSymbols = ['*', '#', '!', '@', '$', '%', '&', '?'] as const;

function randomInt(limit: number): number {
	if (!Number.isSafeInteger(limit) || limit < 1 || limit > 2 ** 32) {
		throw new RangeError('Random selection requires a valid, non-empty range.');
	}

	const buffer = new Uint32Array(1);
	const ceiling = 2 ** 32 - (2 ** 32 % limit);

	// Reject the uneven remainder instead of biasing the selection.
	do {
		globalThis.crypto.getRandomValues(buffer);
	} while (buffer[0] >= ceiling);

	return buffer[0] % limit;
}

function pick<T>(items: readonly T[]): T {
	return items[randomInt(items.length)];
}

function leet(word: string): string {
	const letters = [...word];

	const positions = letters.flatMap((letter, index) => (substitutions[letter] ? [index] : []));

	if (positions.length === 0) {
		return mask(word);
	}

	const changes = 1 + randomInt(Math.min(2, positions.length));

	for (let count = 0; count < changes; count++) {
		const [index] = positions.splice(randomInt(positions.length), 1);
		letters[index] = pick(substitutions[letters[index]]);
	}

	return letters.join('');
}

function mask(word: string, consecutive = false): string {
	const letters = [...word];

	// Keep the first and last letters readable when the word is long enough.
	const positions = letters
		.map((_, index) => index)
		.filter((index) => letters.length <= 2 || (index > 0 && index < letters.length - 1));

	const changes = 1 + randomInt(Math.min(consecutive ? 3 : 2, positions.length));

	if (consecutive) {
		const start = randomInt(positions.length - changes + 1);

		for (let count = 0; count < changes; count++) {
			letters[positions[start + count]] = pick(censorSymbols);
		}
	} else {
		for (let count = 0; count < changes; count++) {
			const [index] = positions.splice(randomInt(positions.length), 1);
			letters[index] = pick(censorSymbols);
		}
	}

	return letters.join('');
}

function censor(word: string): string {
	return leet(word);

	/*switch (randomInt(4)) {
		case 0:
			return leet(word);

		case 1:
			return mask(word);

		case 2:
			return mask(word, true);

		default:
			return mask(leet(word));
			}*/
}

function randomCase(word: string): string {
	return [...word]
		.map((character) => {
			if (!/^[a-z]$/i.test(character)) return character;

			return randomInt(2) === 0 ? character.toLowerCase() : character.toUpperCase();
		})
		.join('');
}

export type PasswordLevel = 1 | 2 | 3;

export type GeneratedPassword = {
	password: string;
	level: PasswordLevel;
	wordCount: 2 | 4 | 8;
};

const levels = [
	{ level: 1, wordCount: 2 }
	//{ level: 2, wordCount: 4 },
	//{ level: 3, wordCount: 8 }
] as const;

export function generatePassword(): GeneratedPassword {
	const { level, wordCount } = pick(levels);

	// Every tier starts with one guaranteed password word.
	const words: string[] = [pick(passwordWords)];

	while (words.length < wordCount) {
		const pool: readonly string[] = randomInt(2) === 0 ? passwordWords : passphraseWords;

		const available = pool.filter((word) => !words.includes(word));
		words.push(pick(available));
	}

	// Shuffle so the guaranteed curse is not always in the same position.
	for (let index = words.length - 1; index > 0; index--) {
		const other = randomInt(index + 1);

		[words[index], words[other]] = [words[other], words[index]];
	}

	const censored = words.map((word) => {
		const result = censor(word);

		if (level === 1) {
			return result.toLowerCase();
		} else {
			return randomCase(result);
		}
	});

	return {
		password: censored.join('-'),
		level,
		wordCount
	};
}
