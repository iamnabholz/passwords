<script lang="ts">
	import { onMount } from 'svelte';
	import { playSound } from '#lib/sounds.ts';

	const messages = [
		"probably don't use these for your bank.",
		'your password deserves better. you deserve this.',
		'security called. we let it go to voicemail.',
		'technically, this is a password.',
		'for accounts you are emotionally ready to lose.',
		'your cat could probably guess this.',
		'strong vibes. questionable security.',
		'please disappoint hackers responsibly.',
		'every company worst nightmare.',
		'prepare to meet HR buddy.'
	];

	const LETTER_DELAY = 35;

	let message = $state('');
	let selectedMessage = $state(messages[0]);
	let typingTimer: ReturnType<typeof setInterval> | undefined;

	function randomizeMessage() {
		clearInterval(typingTimer);

		const choices = messages.filter((text) => text !== selectedMessage);
		selectedMessage = choices[Math.floor(Math.random() * choices.length)];

		message = '';
		void playSound('print');

		let index = 0;

		typingTimer = setInterval(() => {
			index += 1;
			message = selectedMessage.slice(0, index);

			if (index >= selectedMessage.length) {
				clearInterval(typingTimer);
				typingTimer = undefined;
			}
		}, LETTER_DELAY);
	}

	onMount(() => {
		randomizeMessage();

		return () => clearInterval(typingTimer);
	});
</script>

<button
	type="button"
	class="monitor-message"
	onclick={randomizeMessage}
	title="Click for another questionable security tip"
>
	<svg
		class="monitor"
		xmlns="http://www.w3.org/2000/svg"
		xml:space="preserve"
		fill-rule="evenodd"
		stroke-linejoin="round"
		stroke-miterlimit="2"
		clip-rule="evenodd"
		viewBox="0 0 24 24"
		aria-hidden="true"
		focusable="false"
	>
		<path
			class="frame"
			fill-rule="nonzero"
			d="M16 22H8v-2h3v-2H4v-2h16v2h-7v2h3zM4 16H2V4h2zm18 0h-2V4h2zM20 4H4V2h16z"
		/>
		<path class="screen" d="M4 4h16v12H4z" />
		<path
			class="face"
			d="M9 13H7v-2h2zm6 0v-2h2v2zm-6 0h6v2H9zm8-6v2h-2V7zM9 7v2H7V7zm-7 9H0V4h2zM2 4V2h2v2zm2-2V0h16v2zm16 0h2v2h-2zm2 2h2v12h-2zm0 12v2h-2v-2zm-2 2v2h-2v2h-2v-2h-3v-2zm-4 4v2H8v-2zm-8 0H6v-2H4v-2h7v2H8zm-4-4H2v-2h2z"
		/>
	</svg>

	<span class="message-bubble">
		<span
			class="message-text"
			aria-live="polite"
			aria-atomic="true"
			aria-busy={message !== selectedMessage}
		>
			{message}
		</span>
	</span>
</button>

<style>
	.monitor-message {
		display: grid;
		grid-template-columns: 3.5rem minmax(0, 1fr);

		align-items: center;
		gap: var(--spacing-medium);
		width: fit-content;
		max-width: 100%;
		margin: var(--spacing-medium) auto;

		min-height: 4rem;

		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.monitor {
		--shadow-offset-reverse: calc(var(--shadow-offset) * -1) var(--shadow-offset) var(--color-text);
		display: block;
		width: 100%;
		overflow: visible;
		filter: drop-shadow(var(--shadow-offset-reverse));
		animation: float-monitor 12s ease-in-out infinite alternate-reverse;
	}

	@keyframes float-monitor {
		50% {
			transform: translateY(3px) rotateZ(6deg);
		}
		100% {
			transform: translateY(-9px) rotateZ(-6deg);
		}
	}

	.screen {
		fill: var(--color-accent);
	}

	.frame {
		fill: var(--color-surface);
	}

	.face {
		fill: var(--color-text);
	}

	.message-bubble {
		--color-bubble: color-mix(in srgb, var(--color-secondary) 80%, var(--color-surface) 100%);

		position: relative;
		min-width: 0;
		padding: var(--spacing-small) var(--spacing-medium);
		background: var(--color-bubble);
		color: var(--color-text);
		border: var(--border-width) solid var(--color-secondary);
		border-radius: var(--radius-small);
		box-shadow: var(--shadow-offset) var(--shadow-offset) 0 var(--color-secondary);
		text-align: left;
	}

	.message-bubble::before {
		content: '';
		position: absolute;
		top: calc(50% - 0.4rem);
		left: calc(-0.4rem - var(--border-width) / 2);
		width: 0.75rem;
		height: 0.75rem;
		background: var(--color-bubble);
		border-left: var(--border-width) solid var(--color-secondary);
		border-bottom: var(--border-width) solid var(--color-secondary);
		transform: rotate(45deg);
	}
	.message-text {
		display: block;
		position: relative;
		margin: 0;
		min-height: 1.5em;

		font-size: var(--font-size-small);
		line-height: 1.5;
		overflow-wrap: anywhere;
	}

	@media (max-width: 380px) {
		.monitor-message {
			grid-template-columns: 2.75rem minmax(0, 1fr);
			gap: 0.75rem;
		}

		.message-bubble {
			padding: var(--spacing-small);
		}
	}
</style>
