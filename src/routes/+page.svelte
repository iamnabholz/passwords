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

<svelte:head>
	<title>Bad Password — Questionable vocabulary.</title>
	<meta
		name="description"
		content="Questionable vocabulary. Excellent little numbers. A ridiculous, client-side novelty password generator. Not a security product."
	/>
	<meta name="theme-color" content="#ffdd36" />
</svelte:head>

<main>
	<div class="symbol symbol-hash" aria-hidden="true">#</div>
	<div class="symbol symbol-at" aria-hidden="true">@</div>
	<div class="symbol symbol-dollar" aria-hidden="true">$</div>

	<section class="card" aria-labelledby="title">
		<span class="badge">VERY SERIOUS SECURITY™</span>
		<h1 id="title">bad<br />password.</h1>
		<p class="subtitle">Questionable vocabulary.<br />Better security.</p>

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

		<footer>
			<p>probably don't use these for your bank. or do, i am not your mom.</p>
		</footer>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #ffdd36;
		color: #111;
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
		-webkit-font-smoothing: antialiased;
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(::selection) {
		background: #ff91bd;
		color: #111;
	}

	main {
		position: relative;
		isolation: isolate;
		display: grid;
		place-items: center;
		min-height: 100svh;
		padding: 48px 24px 57px;
		overflow: hidden;
	}

	.symbol {
		position: absolute;
		z-index: -1;
		font-weight: 900;
		line-height: 1;
		text-shadow: 4px 4px 0 #111;
		pointer-events: none;
		user-select: none;
	}

	.symbol-hash {
		color: #ff91bd;
		font-size: clamp(220px, 34vw, 440px);
		top: -40px;
		left: -25px;
		transform: rotate(-15deg);
	}

	.symbol-at {
		color: #63e5ef;
		font-size: clamp(260px, 36vw, 460px);
		right: -65px;
		bottom: -75px;
		transform: rotate(12deg);
	}

	.symbol-dollar {
		color: #ff91bd;
		font-size: clamp(95px, 11vw, 150px);
		right: 12%;
		top: 12%;
		transform: rotate(15deg);
	}

	.card {
		width: 100%;
		max-width: 520px;
		padding: 36px;
		background: #fff8e8;
		border: 3px solid #111;
		border-radius: 28px;
		box-shadow: 9px 9px 0 #111;
		transform: rotate(-0.5deg);
	}

	.badge {
		position: absolute;
		left: -24px;
		top: 0;
		display: inline-block;
		padding: 8px 12px;
		border: 2px solid #111;
		border-radius: 999px;
		background: #ff91bd;
		font-size: 18px;
		font-weight: 800;
		letter-spacing: 0.035em;
		transform: rotate(-8deg);
	}

	h1 {
		margin: 27px 0 23px;
		font-family: system-ui, sans-serif;
		font-size: clamp(3.25rem, 11.5vw, 5.3rem);
		font-weight: 900;
		line-height: 0.88;
		letter-spacing: -0.075em;
		line-height: 0.9;
	}

	.subtitle {
		margin: 0 0 27px;
		font-size: 13px;
		line-height: 1.7;
	}

	.password-display {
		display: flex;
		align-items: center;
		min-height: 105px;
		padding: 24px;
		border-radius: 16px;
		background: #111;
		color: #fff8e8;
	}

	.password {
		min-width: 0;
		font-size: clamp(1.25rem, 5vw, 1.75rem);
		font-weight: 800;
		line-height: 1.4;
		overflow-wrap: anywhere;
		user-select: all;
		animation: password-in 160ms ease-out;
	}

	.actions {
		display: flex;
		gap: 14px;
		margin-top: 18px;
	}

	button {
		min-height: 53px;
		padding: 12px 14px;
		border: 2px solid #111;
		border-radius: 12px;
		box-shadow: 4px 4px 0 #111;
		color: #111;
		font: inherit;
		font-size: 14px;
		font-weight: 800;
		cursor: pointer;
		touch-action: manipulation;
		transition:
			transform 100ms ease,
			box-shadow 100ms ease,
			background-color 100ms ease;
	}

	.generate {
		flex: 1;
		background: #63e5ef;
	}

	.generate span {
		display: inline-block;
		margin-left: 4px;
		font-size: 22px;
		line-height: 0.7;
		vertical-align: -2px;
	}

	.copy {
		min-width: 101px;
		background: #fff8e8;
	}

	@media (hover: hover) {
		button:hover:not(:disabled) {
			transform: translate(-1px, -1px);
			box-shadow: 5px 5px 0 #111;
		}
		.copy:hover:not(:disabled) {
			background: #ff91bd;
		}
	}

	button:active:not(:disabled) {
		transform: translate(4px, 4px);
		box-shadow: 0 0 0 #111;
	}

	button:focus-visible {
		outline: 3px solid #111;
		outline-offset: 6px;
	}

	button:disabled {
		cursor: wait;
		opacity: 0.6;
	}

	footer {
		margin-top: 28px;
		color: #686257;
		text-align: center;
		font-size: 10px;
		line-height: 1.6;
	}

	footer p {
		margin: 0;
	}

	.copy-error {
		margin: 18px 0 0;
		font-size: 12px;
		line-height: 1.5;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	@keyframes password-in {
		from {
			opacity: 0;
			transform: translateY(3px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 400px) {
		main {
			padding: 32px 20px 41px;
		}
		.card {
			padding: 28px 22px;
		}
		h1 {
			font-size: clamp(2.7rem, 13vw, 3.25rem);
		}
		.password-display {
			padding: 20px 16px;
		}
		.actions {
			gap: 10px;
		}
		button {
			padding-inline: 10px;
			font-size: 12px;
		}
		.copy {
			min-width: 82px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
		.password {
			animation: none;
		}
	}
</style>
