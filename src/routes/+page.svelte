<script lang="ts">
	import { onMount } from 'svelte';
	import { generatePassword } from '#lib/password.ts';
	import { playGenerateSound, playCopySound, disposeSounds } from '#lib';

	const badgeMessages = [
		'VERY SERIOUS SECURITY™',
		'TRUST ME, BRO™',
		'MILITARY GRADE NONSENSE',
		'SECURITY THROUGH BAD WORDS',
		'PROTECTED BY STRONG VIBES',
		'YOUR SECRETS, PROBABLY SAFE',
		'HACKERS HATE THIS NONSENSE',
		'PASSWORD123 COULD NEVER',
		'CERTIFIED BY ABSOLUTELY NOBODY',
		'FORT KNOX FROM TEMU',
		'PLEASE STOP USING PASSWORD123',
		'WE TAKE NONSENSE SERIOUSLY',
		'ENCRYPTED WITH GOOD INTENTIONS',
		'AUDITED BY MY CAT',
		'ZERO TRUST, MAXIMUM CONFIDENCE'
	];

	let badgeText = $state(badgeMessages[0]);

	function changeBadge() {
		const options = badgeMessages.filter((message) => message !== badgeText);
		badgeText = options[Math.floor(Math.random() * options.length)];
	}

	let password = $state('');
	let copied = $state(false);
	let copyError = $state('');
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	let copyAttempt = 0;

	function makeItWorse() {
		let next = generatePassword();
		while (next === password) next = generatePassword();
		password = next;
		copyAttempt += 1;
		clearTimeout(copyTimer);
		copied = false;
		copyError = '';
	}

	async function copyPassword() {
		const attempt = ++copyAttempt;
		clearTimeout(copyTimer);
		copied = false;
		copyError = '';

		try {
			await navigator.clipboard.writeText(password);
			if (attempt !== copyAttempt) return;

			copied = true;
			void playCopySound();

			copyTimer = setTimeout(() => (copied = false), 1800);
		} catch {
			if (attempt !== copyAttempt) return;
			copyError = "Couldn't copy. Select the password to copy it manually.";
		}
	}

	let generatePressed = $state(false);
	let copyPressed = $state(false);

	function generateWithSound() {
		makeItWorse();
		void playGenerateSound();
	}

	function handleShortcut(event: KeyboardEvent) {
		if (
			!password ||
			event.defaultPrevented ||
			event.isComposing ||
			event.metaKey ||
			event.ctrlKey ||
			event.altKey
		) {
			return;
		}

		const target = event.target;

		if (
			target instanceof HTMLElement &&
			(target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))
		) {
			return;
		}

		if (event.key === ' ') {
			// Preserve normal Space activation on focused buttons and links.
			if (
				target instanceof HTMLElement &&
				target.closest('button, a[href], summary, [role="button"], [role="link"]')
			) {
				return;
			}

			event.preventDefault();

			if (event.repeat || generatePressed) return;

			generatePressed = true;
			generateWithSound();
		} else if (event.key.toLowerCase() === 'c') {
			event.preventDefault();

			if (event.repeat || copyPressed) return;

			copyPressed = true;
			void copyPassword();
		}
	}

	function releaseShortcut(event: KeyboardEvent) {
		if (event.key === ' ') generatePressed = false;
		if (event.key.toLowerCase() === 'c') copyPressed = false;
	}

	function clearShortcutPresses() {
		generatePressed = false;
		copyPressed = false;
	}

	onMount(() => {
		makeItWorse();

		return () => {
			copyAttempt += 1;
			clearTimeout(copyTimer);
			disposeSounds();
		};
	});
</script>

<svelte:window onkeydown={handleShortcut} onkeyup={releaseShortcut} onblur={clearShortcutPresses} />

<div class="password-app">
	<div class="symbols" aria-hidden="true">
		<div class="symbol symbol-hash">
			<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"
				><path
					d="M14 14v-4h-4v4h4Zm7 2h-6v5h-2v-5H9v5H7v-5H3v-2h5v-4H3V8h6V3h2v5h4V3h2v5h4v2h-5v4h5v2Z"
				/></svg
			>
		</div>
		<div class="symbol symbol-at">
			<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"
				><path d="M9 8h6v2H9zm0 6h8v2H9zm-2 0v-4h2v4z" /><path
					d="M13 14V8h2v6zm4-8h2v8h-2zM7 4h10v2H7zM3 8h2v8H3zm4 10h12v2H7zm-2-2h2v2H5zm14 0h2v2h-2zM5 6h2v2H5z"
				/></svg
			>
		</div>
		<div class="symbol symbol-dollar">
			<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"
				><path
					d="M17 18h-4v4h-2v-4H7v-2h10v2Zm2-2h-2v-3h2v3Zm-2-3H7v-2h10v2ZM7 11H5V8h2v3Zm6-5h4v2H7V6h4V2h2v4Z"
				/></svg
			>
		</div>
	</div>

	<main class="password-generator">
		<section class="card" aria-labelledby="title">
			<span>
				<button
					type="button"
					class="badge"
					onclick={changeBadge}
					title="Click for another very serious security claim"
				>
					<span aria-live="polite" aria-atomic="true">{badgeText}</span>
				</button>

				<h1 id="title" aria-label="Passwords">
					<span class="scribbled-letter"
						>p<svg
							class="letter-scribble"
							viewBox="0 0 100 140"
							preserveAspectRatio="none"
							aria-hidden="true"
							focusable="false"
						>
							<path
								d="
								M12 40 Q45 28 86 38
								L14 54 L88 47
								L10 69 L91 58
								L12 84 L88 72
								L9 98 L91 86
								L48 110
							"
							/>
						</svg></span
					>asswords.
				</h1>
				<p class="subtitle">a funny password generator with questionable vocabulary.</p>
			</span>

			<span class="password-section">
				<div class="password-display" aria-live="polite" aria-atomic="true">
					<span class="sr-only">Generated password: </span>
					{#key password}
						<span class="password">{password || 'censoring…'}</span>
					{/key}
				</div>

				<div class="actions">
					<button
						class="generate"
						class:is-pressed={generatePressed}
						onclick={generateWithSound}
						disabled={!password}
						aria-keyshortcuts="Space"
						title="Generate a new password — Space"
					>
						make it worse <span aria-hidden="true"
							><svg
								height="24"
								width="24"
								xmlns="http://www.w3.org/2000/svg"
								fill="currentColor"
								viewBox="0 0 24 24"
								><path
									d="M13 20H9V18H13V20ZM19 16H21V18H19V20H17V18H15V16H17V8H19V16ZM9 18H7V16H9V18ZM7 6H9V8H7V16H5V8H3V6H5V4H7V6ZM15 16H13V14H15V16ZM23 16H21V14H23V16ZM3 10H1V8H3V10ZM11 10H9V8H11V10ZM17 8H15V6H17V8ZM15 6H11V4H15V6Z"
								/></svg
							></span
						>
					</button>
					<button
						class="copy"
						class:is-pressed={copyPressed}
						onclick={copyPassword}
						disabled={!password}
						aria-keyshortcuts="C"
						title="Copy the password — C"
					>
						{copied ? 'copied!' : 'copy'}
					</button>
				</div>
				<p class="sr-only" role="status">{copied ? 'Password copied to clipboard.' : ''}</p>
				{#if copyError}
					<p class="copy-error" role="alert">{copyError}</p>
				{/if}
			</span>

			<footer>
				<p>probably don't use these for your bank.</p>
				<p>
					designed and developed by
					<a target="_blank" href="https://nabholz.work">Lukas Nabholz</a>.
				</p>
				<p>
					<a target="_blank" href="https://buymeacoffee.com/nabholz">buy me a coffee</a>.
					<a target="_blank" href="https://github.com/iamnabholz/bad-password">open source</a>.
				</p>
			</footer>
		</section>
	</main>
</div>
