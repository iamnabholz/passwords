<script lang="ts">
	import { onMount } from 'svelte';
	import { generatePassword } from '#lib/password.ts';

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
			copyTimer = setTimeout(() => (copied = false), 1800);
		} catch {
			if (attempt !== copyAttempt) return;
			copyError = "Couldn't copy. Select the password to copy it manually.";
		}
	}

	onMount(() => {
		makeItWorse();
		return () => {
			copyAttempt += 1;
			clearTimeout(copyTimer);
		};
	});
</script>

<div class="password-app">
	<div class="symbols" aria-hidden="true">
		<div class="symbol symbol-hash">#</div>
		<div class="symbol symbol-at">@</div>
		<div class="symbol symbol-dollar">$</div>
	</div>

	<main class="password-generator">
		<section class="card" aria-labelledby="title">
			<span class="badge">VERY SERIOUS SECURITY™</span>
			<h1 id="title">passwords.</h1>
			<p class="subtitle">Questionable vocabulary.<br />Better security.</p>

			<p>
				A funny password generator with questionable vocabulary. Generate a new password, then copy
				it with one click. Passwords are generated in your browser.
			</p>

			<div class="password-display" aria-live="polite" aria-atomic="true">
				<span class="sr-only">Generated password: </span>
				{#key password}
					<span class="password">{password || 'censoring…'}</span>
				{/key}
			</div>

			<div class="actions">
				<button class="generate" onclick={makeItWorse} disabled={!password}>
					make it worse <span aria-hidden="true">↻</span>
				</button>
				<button class="copy" onclick={copyPassword} disabled={!password}>
					{copied ? 'copied!' : 'copy'}
				</button>
			</div>
			<p class="sr-only" role="status">{copied ? 'Password copied to clipboard.' : ''}</p>
			{#if copyError}
				<p class="copy-error" role="alert">{copyError}</p>
			{/if}
		</section>

		<footer class="card">
			<p>probably don't use these for your bank. or do, i am not your mom.</p>
			<p>
				Designed and developed by
				<a target="_blank" href="https://nabholz.work">Lukas Nabholz</a>.
			</p>
			<p>
				Keep wacky ideas like this going,
				<a target="_blank" href="https://buymeacoffee.com/nabholz">Buy Me A Coffee</a>.
			</p>
		</footer>
	</main>
</div>
