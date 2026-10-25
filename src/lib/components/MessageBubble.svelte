<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { currentState, type MessageType } from '#lib/state.svelte.ts';
	import { playSound } from '#lib/sounds.ts';

	const LETTER_DELAY = 35;

	const messages: Record<MessageType, string[]> = {
		greeting: [
			'hello. ready to make a questionable password?',
			'welcome. your security is in our hands.'
		],
		update: ['a new version is ready'],
		generation: ['another password-shaped mistake.', 'freshly generated. still questionable.'],
		security: [
			'security level changed. confidence unchanged.',
			'more security. same questionable choices.'
		],
		copy: [
			'careful with that.',
			'prepare to meet HR buddy.',
			'i dare you to use it as a username.'
		],
		copyError: ['could not copy that password.']
	};

	let message = $state('.');
	let isTyping = $state(false);
	let waitingWorker = $state<ServiceWorker | null>(null);
	let isUpdating = $state(false);

	let selectedMessage = '';
	let activeType: MessageType | null = null;
	let checkedForUpdates = false;

	let typingTimer: ReturnType<typeof setInterval> | undefined;
	let dotsTimer: ReturnType<typeof setInterval> | undefined;

	let checkStartedAt = 0;
	let finishTimer: ReturnType<typeof setTimeout> | undefined;

	function stopTimers() {
		if (typingTimer) clearInterval(typingTimer);
		if (dotsTimer) clearInterval(dotsTimer);

		typingTimer = undefined;
		dotsTimer = undefined;
	}

	function showDots() {
		let dots = 1;
		message = '.';

		dotsTimer = setInterval(() => {
			dots = dots === 3 ? 1 : dots + 1;
			message = '.'.repeat(dots);
		}, LETTER_DELAY * 4);
	}

	function typeMessage(text: string) {
		void playSound('print', {
			characterCount: text.length,
			characterDelay: LETTER_DELAY
		});

		let index = 0;

		typingTimer = setInterval(() => {
			index += 1;
			message = text.slice(0, index);

			if (index >= text.length) {
				if (typingTimer) clearInterval(typingTimer);
				typingTimer = undefined;
				isTyping = false;
			}
		}, LETTER_DELAY);
	}

	function showMessage(type: MessageType, customText?: string) {
		if (!checkedForUpdates && type !== 'update') return;
		if (waitingWorker && type !== 'update') return;
		if (activeType === 'update' && type !== 'update') return;

		// Updates always interrupt. A copy error can interrupt an ordinary message.
		if (isTyping && type !== 'update' && (type !== 'copyError' || activeType === 'copyError')) {
			return;
		}

		const options = messages[type].filter((text) => text !== selectedMessage);
		const choices = options.length > 0 ? options : messages[type];
		const nextMessage = customText ?? choices[Math.floor(Math.random() * choices.length)];

		stopTimers();
		activeType = type;
		selectedMessage = nextMessage;
		message = '';
		isTyping = true;

		void typeMessage(nextMessage);
	}

	function finishUpdateCheck() {
		if (checkedForUpdates || finishTimer) return;

		// Keep the initial dots visible long enough to render.
		const delay = waitingWorker ? 0 : Math.max(0, 250 - (performance.now() - checkStartedAt));

		if (delay > 0) {
			finishTimer = setTimeout(() => {
				finishTimer = undefined;
				finishUpdateCheck();
			}, delay);
			return;
		}

		checkedForUpdates = true;
		currentState.hasCheckedForUpdates = true;
		showMessage(waitingWorker ? 'update' : 'greeting');
	}

	function installUpdate() {
		if (!waitingWorker || isUpdating) return;

		isUpdating = true;
		waitingWorker.postMessage({ type: 'SKIP_WAITING' });
	}

	onMount(() => {
		checkStartedAt = performance.now();
		showDots();

		currentState.hasCheckedForUpdates = false;
		currentState.isReadyToUpdate = false;

		// SvelteKit's service worker is used in production, not dev.
		if (import.meta.env.DEV || !('serviceWorker' in navigator)) {
			finishUpdateCheck();
			return stopTimers;
		}

		let disposed = false;
		let registration: ServiceWorkerRegistration | undefined;
		let installingWorker: ServiceWorker | null = null;
		let hadController = Boolean(navigator.serviceWorker.controller);
		let reloading = false;

		function checkWaitingWorker() {
			waitingWorker = navigator.serviceWorker.controller ? (registration?.waiting ?? null) : null;

			currentState.isReadyToUpdate = Boolean(waitingWorker);

			if (!waitingWorker) return;

			if (!checkedForUpdates) {
				finishUpdateCheck();
			} else if (activeType !== 'update') {
				showMessage('update');
			}
		}

		function handleWorkerState() {
			checkWaitingWorker();

			if (installingWorker?.state === 'installed' || installingWorker?.state === 'redundant') {
				finishUpdateCheck();
			}
		}

		function watchInstallation() {
			installingWorker?.removeEventListener('statechange', handleWorkerState);
			installingWorker = registration?.installing ?? null;
			installingWorker?.addEventListener('statechange', handleWorkerState);
			handleWorkerState();
		}

		function checkForUpdates() {
			checkWaitingWorker();

			void registration?.update().then(
				() => {
					if (disposed) return;

					checkWaitingWorker();

					// Wait for a newly found worker to finish installing.
					if (!registration?.installing) finishUpdateCheck();
				},
				() => {
					if (!disposed && !registration?.installing) finishUpdateCheck();
				}
			);
		}

		function handleControllerChange() {
			// Don't reload on the service worker's first installation.
			if (!hadController) {
				hadController = true;
				return;
			}

			if (reloading) return;

			reloading = true;
			window.location.reload();
		}

		navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

		void navigator.serviceWorker.ready.then(
			(readyRegistration) => {
				if (disposed) return;

				registration = readyRegistration;
				registration.addEventListener('updatefound', watchInstallation);

				watchInstallation();
				checkForUpdates();

				window.addEventListener('focus', checkForUpdates);
				window.addEventListener('online', checkForUpdates);
			},
			() => {
				if (!disposed) finishUpdateCheck();
			}
		);

		return () => {
			disposed = true;
			stopTimers();

			if (finishTimer) clearTimeout(finishTimer);

			navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
			registration?.removeEventListener('updatefound', watchInstallation);
			installingWorker?.removeEventListener('statechange', handleWorkerState);
			window.removeEventListener('focus', checkForUpdates);
			window.removeEventListener('online', checkForUpdates);
		};
	});

	$effect(() => {
		const version = currentState.messageVersion;
		const type = currentState.lastAction;
		const text = currentState.lastMessage;

		if (!version || !type) return;

		untrack(() => showMessage(type, text ?? undefined));
	});
</script>

<div class="monitor-message">
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

	<div class="message-bubble">
		<span
			class="message-text"
			role="status"
			aria-live="polite"
			aria-atomic="true"
			aria-busy={isTyping}
		>
			{message}
		</span>

		{#if waitingWorker}
			<button type="button" class="update-button" onclick={installUpdate} disabled={isUpdating}>
				{isUpdating ? 'updating…' : 'update now'}
			</button>
		{/if}
	</div>
</div>

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
		color: inherit;
		font: inherit;
		text-align: left;
	}

	.monitor {
		--shadow-offset-reverse: calc(var(--shadow-offset) * -1) var(--shadow-offset) var(--color-text);
		display: block;
		width: 100%;
		overflow: visible;
		filter: drop-shadow(var(--shadow-offset-reverse));
		/*
		animation: float-monitor 12s ease-in-out infinite alternate-reverse;
		*/
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
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--spacing-small);
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
		position: relative;
		min-width: 0;
		min-height: 1.5em;
		margin: 0;
		font-size: var(--font-size-small);
		line-height: 1.5;
		overflow-wrap: anywhere;
	}

	.update-button {
		position: relative;
		padding: 0.25rem var(--spacing-small);
		background: var(--color-accent);
		color: var(--color-text);
		border: var(--border-width) solid var(--color-text);
		border-radius: var(--radius-small);
		box-shadow: var(--shadow-small);
		font: inherit;
		font-size: var(--font-size-tiny);
		font-weight: 700;
		white-space: nowrap;
		cursor: pointer;
		touch-action: manipulation;
	}

	.update-button:active:not(:disabled) {
		transform: translate(var(--shadow-offset), var(--shadow-offset));
		box-shadow: 0 0 0 var(--color-text);
	}

	.update-button:disabled {
		opacity: 0.6;
		cursor: wait;
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
