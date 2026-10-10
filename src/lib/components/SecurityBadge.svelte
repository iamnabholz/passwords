<script lang="ts">
	import { onMount } from 'svelte';
	import { playSound, disposeSounds } from '#lib/sounds.ts';

	const messages = [
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

	let text = $state(messages[Math.round(Math.random() * messages.length)]);

	function changeMessage() {
		const options = messages.filter((message) => message !== text);
		text = options[Math.floor(Math.random() * options.length)];
		void playSound('action');
	}

	onMount(() => {
		text = messages[Math.floor(Math.random() * messages.length)];

		return () => {
			disposeSounds();
		};
	});
</script>

<button
	type="button"
	class="badge"
	onclick={changeMessage}
	title="Click for another very serious security claim"
>
	<span aria-live="polite" aria-atomic="true">{text}</span>
</button>

<style>
	.badge {
		position: absolute;
		top: 0;
		left: -1rem;
		width: max-content;
		max-width: calc(100% + 1rem);
		padding: var(--spacing-small) var(--spacing-medium);
		padding-top: calc(var(--spacing-small) + 1px);
		background: var(--color-secondary);
		color: var(--color-text);
		border: var(--border-width) solid var(--color-text);
		border-radius: 9999px;
		font-size: clamp(0.65rem, 0.5rem + 0.8vw, var(--font-size-small));
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: 0.035em;
		text-align: center;
		white-space: nowrap;
		transform-origin: left center;
		cursor: pointer;
		touch-action: manipulation;
		transform: scale(1) rotateZ(-6deg);
		transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.badge:active {
		transform: scale(1.08, 0.8) rotateZ(-6deg);
		transition: transform 80ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.badge {
			transition: none;
		}

		.badge:active {
			transform: rotateZ(-6deg);
		}
	}
</style>
