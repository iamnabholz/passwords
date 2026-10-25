<script lang="ts">
	import BackgroundSymbols from '#lib/components/BackgroundSymbols.svelte';
	import SecurityBadge from '#lib/components/SecurityBadge.svelte';
	import PasswordGenerator from '#lib/components/PasswordGenerator.svelte';
	import MessageBubble from '#lib/components/MessageBubble.svelte';

	import wordmark from '#lib/content/wordmark.svg?url';
</script>

<div class="password-app">
	<BackgroundSymbols />

	<main class="password-generator">
		<section class="card" aria-labelledby="title">
			<SecurityBadge />

			<header>
				<div class="title-row">
					<h1 id="title" aria-label="Passwords">
						<img
							class="wordmark"
							src={wordmark}
							alt=""
							aria-hidden="true"
							width="514"
							height="88"
						/>
					</h1>
				</div>

				<p class="subtitle">a funny password generator with questionable vocabulary.</p>
			</header>

			<PasswordGenerator />

			<MessageBubble />
			<footer>
				<p>
					designed and developed by
					<a target="_blank" href="https://nabholz.work">Lukas Nabholz</a>.
				</p>

				<p>
					<a target="_blank" href="https://buymeacoffee.com/nabholz"> buy me a coffee</a>.
					<a target="_blank" href="https://github.com/iamnabholz/bad-password"> open source</a>.
				</p>
			</footer>
		</section>
	</main>
</div>

<style>
	.password-app {
		position: relative;
		isolation: isolate;
		min-height: 100svh;
	}

	.password-generator {
		display: grid;
		place-items: center;
		align-content: center;
		gap: var(--spacing-gap);
		min-height: 100svh;
		padding: var(--spacing-card-padding);
	}

	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-large);
		width: 100%;
		min-width: 0;
		max-width: var(--card-width);
		padding: var(--spacing-card-padding);
		background: var(--color-surface);
		border: var(--border-width-heavy) solid var(--color-text);
		border-radius: var(--radius-large);
		box-shadow: var(--shadow-large);
		transform: rotate(-0.5deg);
	}

	.title-row {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: var(--spacing-small);
		margin-bottom: var(--spacing-medium);
	}

	.title-row h1 {
		width: 100%;
		min-width: 0;
	}

	.wordmark {
		display: block;
		width: clamp(17.5rem, 58.4vw, 29.2rem);
		max-width: 100%;
		height: auto;
	}

	.subtitle {
		font-size: var(--font-size-caption);
		line-height: 1.4;
	}

	footer {
		padding-block-start: var(--spacing-medium);
		border-top: 2px dashed #bdb7a8;
		color: var(--color-muted);
		text-align: center;
		font-size: var(--font-size-caption);
		line-height: var(--line-height);
	}
</style>
