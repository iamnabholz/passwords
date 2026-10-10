<script lang="ts">
	import { onMount } from 'svelte';

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

	let message = $state(messages[0]);
	let monitorRotation = $state(-5);
	let bubbleRotation = $state(1.5);

	function randomizeMessage() {
		const choices = messages.filter((text) => text !== message);

		message = choices[Math.floor(Math.random() * choices.length)];
		monitorRotation = -(Math.random() * 6 + 2);
		bubbleRotation = Math.random() * 3 + 0.5;
	}

	onMount(randomizeMessage);
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
		viewBox="0 0 24 24"
		aria-hidden="true"
		focusable="false"
		style:--rotation={`${monitorRotation}deg`}
	>
		<!-- Screen and the original pixel-style monitor frame. -->
		<path class="screen" d="M4 4h16v12H4z" />
		<path
			class="frame"
			d="M16 22H8v-2h3v-2H4v-2h16v2h-7v2h3zM4 16H2V4h2zm18 0h-2V4h2zM20 4H4V2h16z"
		/>

		<!-- Square eyes and a stepped pixel smile. -->
		<g class="face">
			<rect x="7" y="7" width="2" height="2" />
			<rect x="15" y="7" width="2" height="2" />
			<path d="M7 11h2v2h6v-2h2v2h-2v2H9v-2H7z" />
		</g>
	</svg>

	<span class="message-bubble" style:--rotation={`${bubbleRotation}deg`}>
		<span class="message-text" aria-live="polite">{message}</span>
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
		margin: var(--spacing-large) auto;

		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.monitor {
		display: block;
		width: 100%;
		overflow: visible;
		transform: rotate(var(--rotation));
		transition: transform 300ms linear;
	}

	.screen {
		fill: var(--color-accent);
	}

	.frame {
		fill: var(--color-text);
	}

	.face {
		fill: var(--color-surface);
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
		transform: rotate(var(--rotation));
		text-align: left;
		transition: transform 300ms linear;
	}

	.message-bubble::before {
		content: '';
		position: absolute;
		top: calc(50% - 0.375rem);
		left: calc(-0.375rem - var(--border-width) / 2);
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
