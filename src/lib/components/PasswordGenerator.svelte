<script lang="ts">
	import { onMount } from 'svelte';
	import { playSound, disposeSounds } from '#lib/sounds.ts';
	import { generatePassword, type PasswordLevel } from '#lib/password.ts';
	import { version } from '../../../package.json';

	let password = $state('');
	let level = $state<PasswordLevel>(1);

	const tierJokes: Record<PasswordLevel, string> = {
		1: 'SECURITY BY VIBES',
		2: 'NOW WITH EXTRA PARANOIA',
		3: 'YOUR KEYBOARD NEEDS A BREAK'
	};

	let copied = $state(false);
	let copyError = $state('');
	let generatePressed = $state(false);
	let copyPressed = $state(false);

	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	let copyAttempt = 0;

	function makeItWorse() {
		let next = generatePassword();

		while (next.password === password) {
			next = generatePassword();
		}

		password = next.password;
		level = next.level;

		copyAttempt += 1;
		clearTimeout(copyTimer);
		copied = false;
		copyError = '';
	}

	function generateWithSound() {
		makeItWorse();
		void playSound('generate');
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
			void playSound('action');

			copyTimer = setTimeout(() => (copied = false), 1800);
		} catch {
			if (attempt !== copyAttempt) return;

			copyError = "Couldn't copy. Select the password to copy it manually.";
		}
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
			// Leave focused controls' native Space behavior intact.
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

<div class="password-section">
	<div class="password-display" aria-live="polite" aria-atomic="true">
		{#if password}
			<div class="password-level">
				<div class="tiny">
					<!--{'> ' + tierJokes[level] + '_'}-->
					<div class="segments" id="segments" aria-hidden="true">
						<i class="segment" class:on={level > 0}></i>
						<i class="segment" class:on={level > 1}></i>
						<i class="segment" class:on={level > 2}></i>
					</div>
				</div>
				<div class="version">v{version}</div>
			</div>

			<!--	<div class="password-level">
				<span>GENERATOR v0.1 · {wordCount} words</span>
				<span>{tierJokes[level]}</span>
				</div>-->
		{/if}

		<span class="sr-only">Generated password: </span>

		{#key password}
			<span class="password">{password || 'censoring…'}</span>
		{/key}
	</div>

	<div class="actions">
		<button
			type="button"
			class="generate"
			class:is-pressed={generatePressed}
			onclick={generateWithSound}
			disabled={!password}
			aria-keyshortcuts="Space"
			title="Generate a new password — Space"
		>
			make it worse
			<span class="icon" aria-hidden="true">
				<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" focusable="false">
					<path
						d="M13 20H9V18H13V20ZM19 16H21V18H19V20H17V18H15V16H17V8H19V16ZM9 18H7V16H9V18ZM7 6H9V8H7V16H5V8H3V6H5V4H7V6ZM15 16H13V14H15V16ZM23 16H21V14H23V16ZM3 10H1V8H3V10ZM11 10H9V8H11V10ZM17 8H15V6H17V8ZM15 6H11V4H15V6Z"
					/>
				</svg>
			</span>
		</button>

		<button
			type="button"
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

	<p class="sr-only" role="status">
		{copied ? 'Password copied to clipboard.' : ''}
	</p>

	{#if copyError}
		<p class="copy-error" role="alert">{copyError}error according to this</p>
	{/if}
</div>

<style>
	.password-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-medium);
		min-width: 0;
	}

	.tiny {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-small);
	}

	.version {
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}

	.password-display {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-medium);
		padding: var(--spacing-medium);
		background: var(--color-text);
		color: var(--color-surface);
		border-radius: var(--radius-medium);
	}

	.password {
		min-width: 0;
		font-size: clamp(1.25rem, 5vw, 1.75rem);
		font-weight: 700;
		line-height: 1.4;
		overflow-wrap: anywhere;
		user-select: all;
		animation: password-in 160ms ease-out;
	}

	.password-level {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-small);
		font-size: var(--font-size-tiny);
		line-height: 1.4;
		text-transform: uppercase;
	}

	.segments {
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.segment {
		width: 16px;
		height: 8px;
		border-radius: 1px;
		border: 1px solid var(--color-muted);
		background: var(--color-muted);
		transition: background 0.15s;
	}
	.segment.on {
		border-color: var(--color-secondary);
		background: var(--color-secondary);
	}

	.password::selection {
		color: #111;
		background-color: white;
	}

	.actions {
		display: flex;
		gap: var(--spacing-medium);
	}

	.actions button {
		min-height: 3.25rem;
		padding: 0.75rem var(--spacing-medium);
		color: var(--color-text);
		border: var(--border-width) solid var(--color-text);
		border-radius: var(--radius-small);
		box-shadow: var(--shadow-small);
		font-size: var(--font-size-small);
		font-weight: 700;
		line-height: 1.2;
		white-space: nowrap;
		cursor: pointer;
		touch-action: manipulation;
		transform: translate(0, 0);
		transition:
			transform var(--transition-fast) ease-out,
			box-shadow var(--transition-fast) ease-out,
			background-color var(--transition-fast) ease-out;
	}

	.generate {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
		background: var(--color-accent);
	}

	.icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.icon svg {
		display: block;
		width: 1.5rem;
		height: 1.5rem;
	}

	.copy {
		min-width: 6rem;
		background: var(--color-surface);
	}

	@media (hover: hover) {
		.actions button:hover:not(:disabled) {
			transform: translate(-1px, -1px);
			box-shadow: var(--shadow-hover);
		}

		.copy:hover:not(:disabled) {
			background: var(--color-secondary);
		}
	}

	.actions button:active:not(:disabled),
	.actions button.is-pressed:not(:disabled) {
		transform: translate(var(--shadow-offset), var(--shadow-offset));
		box-shadow: 0 0 0 var(--color-text);
		transition-duration: 60ms;
	}

	.copy.is-pressed:not(:disabled),
	.copy:active:not(:disabled) {
		background: var(--color-secondary);
	}

	.actions button:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.copy-error {
		font-size: var(--font-size-tiny);
		line-height: var(--line-height);
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

	@media (prefers-reduced-motion: reduce) {
		.actions button {
			transition: none;
		}

		.password {
			animation: none;
		}
	}
</style>
