import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generatePassword } from './password.ts';
import { passwordWords } from './password-words.ts';

const replacements: Record<string, string> = {
	a: '4@',
	i: '1!',
	o: '0',
	s: '5$',
	b: '8',
	e: '3',
	u: '4'
};

const passwordPattern =
	/^(?:x_|69_|69|xx|0|no_|420)([a-z0-9!@$]+)-([a-z0-9!@$]+)_[1-9][0-9]{1,2}(?:!|!!|#|_69|_420|666|_lol)\.([A-Za-z0-9_-]{16})$/;

function originalWord(censored: string): string | undefined {
	return passwordWords.find((word) => {
		if (word.length !== censored.length) return false;
		let changes = 0;
		for (let index = 0; index < word.length; index += 1) {
			if (word[index] === censored[index]) continue;
			if (!replacements[word[index]]?.includes(censored[index])) return false;
			changes += 1;
		}
		return changes >= 1 && changes <= 2;
	});
}

test('vocabulary is expanded, unique, and every word can be censored', () => {
	assert.ok(passwordWords.length >= 200);
	assert.equal(new Set(passwordWords).size, passwordWords.length);
	for (const word of passwordWords) {
		assert.match(word, /^[a-z]+$/);
		assert.match(word, /[aiosbeu]/, `No possible substitution: ${word}`);
	}
	for (const word of ['fuck', 'boob', 'dildo', 'horny', 'twatwaffle', 'dumpsterfire']) {
		assert.ok(
			passwordWords.some((entry) => entry === word),
			`Missing vocabulary: ${word}`
		);
	}
});

test('passwords exceed 15 characters and include two recognizable censored words', () => {
	for (let count = 0; count < 5000; count += 1) {
		const password = generatePassword();
		assert.ok(password.length >= 15 && password.length <= 64, `Unexpected length: ${password}`);
		assert.match(password, /^[!-~]+$/, 'Use printable ASCII without invisible characters');
		const match = password.match(passwordPattern);
		assert.ok(match, `Unexpected password format: ${password}`);
		assert.ok(originalWord(match[1]), `Unrecognizable first word: ${password}`);
		assert.ok(originalWord(match[2]), `Unrecognizable second word: ${password}`);
	}
});

test('cryptographic generation works even if Math.random is unavailable', (context) => {
	context.mock.method(Math, 'random', () => {
		throw new Error('Do not use Math.random for passwords');
	});
	assert.match(generatePassword(), passwordPattern);
});

test('length and censorship hold for deterministic low-end random values', (context) => {
	context.mock.method(globalThis.crypto, 'getRandomValues', (buffer: Uint32Array) => {
		buffer.fill(0);
		return buffer;
	});
	assert.equal(generatePassword(), 'x_d1ck-8itch_10!.AAAAAAAAAAAAAAAA');
});

test('biased remainder values are rejected before selecting an option', (context) => {
	let calls = 0;
	context.mock.method(globalThis.crypto, 'getRandomValues', (buffer: Uint32Array) => {
		buffer.fill(calls++ === 0 ? 0xffffffff : 0);
		return buffer;
	});
	assert.equal(generatePassword(), 'x_d1ck-8itch_10!.AAAAAAAAAAAAAAAA');
	assert.ok(calls > 1);
});

test('the random tail varies independently of the recognizable words', () => {
	const tails = new Set(Array.from({ length: 1000 }, () => generatePassword().split('.').at(-1)));
	assert.equal(tails.size, 1000);
});
