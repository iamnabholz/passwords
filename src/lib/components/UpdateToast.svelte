<script lang="ts">
	import { onMount } from 'svelte';

	let waitingWorker = $state<ServiceWorker | null>(null);
	let updating = $state(false);

	function installUpdate() {
		if (!waitingWorker || updating) return;

		updating = true;
		waitingWorker.postMessage({ type: 'SKIP_WAITING' });
	}

	onMount(() => {
		if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;

		let disposed = false;
		let registration: ServiceWorkerRegistration | undefined;
		let installingWorker: ServiceWorker | null = null;
		let hasController = Boolean(navigator.serviceWorker.controller);
		let reloading = false;

		function detectUpdate() {
			waitingWorker = navigator.serviceWorker.controller ? (registration?.waiting ?? null) : null;
		}

		function watchInstallation() {
			installingWorker?.removeEventListener('statechange', detectUpdate);

			installingWorker = registration?.installing ?? null;
			installingWorker?.addEventListener('statechange', detectUpdate);

			detectUpdate();
		}

		function checkForUpdates() {
			detectUpdate();
			void registration?.update().catch(() => {});
		}

		function handleControllerChange() {
			// The first installation should not reload the page.
			if (!hasController) {
				hasController = true;
				return;
			}

			if (reloading) return;

			reloading = true;
			window.location.reload();
		}

		navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

		void navigator.serviceWorker.ready.then((readyRegistration) => {
			if (disposed) return;

			registration = readyRegistration;
			registration.addEventListener('updatefound', watchInstallation);

			watchInstallation();
			checkForUpdates();

			window.addEventListener('focus', checkForUpdates);
			window.addEventListener('online', checkForUpdates);
		});

		return () => {
			disposed = true;

			navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);

			registration?.removeEventListener('updatefound', watchInstallation);
			installingWorker?.removeEventListener('statechange', detectUpdate);

			window.removeEventListener('focus', checkForUpdates);
			window.removeEventListener('online', checkForUpdates);
		};
	});
</script>

{#if waitingWorker}
	<div class="update-toast">
		<p role="status">
			new update available.
			<span>prepare more questionable choices.</span>
		</p>

		<button type="button" onclick={installUpdate} disabled={updating}>
			{updating ? 'updating…' : 'update & reload'}
		</button>
	</div>
{/if}

<style>
	.update-toast {
		position: fixed;
		left: 50%;
		bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--spacing-medium);
		width: min(var(--card-width), calc(100% - 2rem));
		padding: var(--spacing-medium);
		background: var(--color-surface);
		color: var(--color-text);
		border: var(--border-width-heavy) solid var(--color-text);
		border-radius: var(--radius-large);
		box-shadow: var(--shadow-large);
		font-size: var(--font-size-small);
		transform: translateX(-50%);
	}

	p {
		flex: 1 1 14rem;
		font-weight: 700;
	}

	p span {
		display: block;
		font-size: var(--font-size-caption);
		font-weight: 400;
	}

	button {
		padding: var(--spacing-small) var(--spacing-medium);
		background: var(--color-accent);
		color: var(--color-text);
		border: var(--border-width) solid var(--color-text);
		border-radius: var(--radius-small);
		box-shadow: var(--shadow-small);
		font-weight: 700;
		white-space: nowrap;
		cursor: pointer;
		touch-action: manipulation;
		transition:
			transform var(--transition-fast) ease-out,
			box-shadow var(--transition-fast) ease-out;
	}

	button:active:not(:disabled) {
		transform: translate(var(--shadow-offset), var(--shadow-offset));
		box-shadow: 0 0 0 var(--color-text);
	}

	button:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}
</style>
