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
								L15 112 L85 101
								L22 126 L79 115
								M24 34 Q10 78 30 126
								M48 32 Q37 80 54 128
								M73 34 Q59 80 76 122
							"
						/>
					</svg></span
				>asswords.
			</h1>
			<p class="subtitle">A funny password generator with questionable vocabulary.</p>

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
			<p>probably don't use these for your bank.</p>
			<p>
				designed and developed by
				<a target="_blank" href="https://nabholz.work">Lukas Nabholz</a>.
			</p>
			<p>
				keep wacky ideas like this going,
				<a target="_blank" href="https://buymeacoffee.com/nabholz">buy me a coffee</a>.
			</p>
		</footer>
	</main>
</div>
