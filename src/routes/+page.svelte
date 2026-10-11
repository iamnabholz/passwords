<script lang="ts">
	import BackgroundSymbols from '#lib/components/BackgroundSymbols.svelte';
	import SecurityBadge from '#lib/components/SecurityBadge.svelte';
	import PasswordGenerator from '#lib/components/PasswordGenerator.svelte';
	import MessageBubble from '#lib/components/MessageBubble.svelte';
</script>

<div class="password-app">
	<BackgroundSymbols />

	<main class="password-generator">
		<section class="card" aria-labelledby="title">
			<SecurityBadge />

			<header>
				<div class="title-row">
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
										L48 110
									"
								/>
							</svg></span
						>asswords.
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

	h1 {
		font-family: var(--font-heading);
		font-size: clamp(3rem, 10vw, 5rem);
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: -0.075em;
	}

	.scribbled-letter {
		position: relative;
		display: inline-block;
		isolation: isolate;
	}

	.letter-scribble {
		position: absolute;
		top: -0.02em;
		left: -0.06em;
		z-index: 1;
		width: calc(100% + 0.12em);
		max-width: none;
		height: 1.12em;
		overflow: visible;
		fill: none;
		stroke: var(--color-secondary);
		stroke-width: 7;
		stroke-linecap: round;
		stroke-linejoin: round;
		pointer-events: none;
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
