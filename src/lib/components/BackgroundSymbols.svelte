<div class="symbols" aria-hidden="true">
	<div class="symbol symbol-hash">
		<svg fill="currentColor" viewBox="0 0 24 24" focusable="false">
			<path
				d="M14 14v-4h-4v4h4Zm7 2h-6v5h-2v-5H9v5H7v-5H3v-2h5v-4H3V8h6V3h2v5h4V3h2v5h4v2h-5v4h5v2Z"
			/>
		</svg>
	</div>

	<div class="symbol symbol-at">
		<svg fill="currentColor" viewBox="0 0 24 24" focusable="false">
			<path d="M9 8h6v2H9zm0 6h8v2H9zm-2 0v-4h2v4z" />
			<path
				d="M13 14V8h2v6zm4-8h2v8h-2zM7 4h10v2H7zM3 8h2v8H3zm4 10h12v2H7zm-2-2h2v2H5zm14 0h2v2h-2zM5 6h2v2H5z"
			/>
		</svg>
	</div>

	<div class="symbol symbol-dollar">
		<svg fill="currentColor" viewBox="0 0 24 24" focusable="false">
			<path
				d="M17 18h-4v4h-2v-4H7v-2h10v2Zm2-2h-2v-3h2v3Zm-2-3H7v-2h10v2ZM7 11H5V8h2v3Zm6-5h4v2H7V6h4V2h2v4Z"
			/>
		</svg>
	</div>
</div>

<style>
	@property --orbit-angle {
		syntax: '<angle>';
		inherits: false;
		initial-value: 0deg;
	}

	.symbols {
		position: fixed;
		inset: 0;
		height: 100svh;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
		user-select: none;
	}

	.symbol {
		position: absolute;
		aspect-ratio: 1;
		transform: translate(-50%, -50%);
		filter: drop-shadow(var(--shadow-small));

		--orbit-x: 5vw;
		--orbit-y: 5svh;

		translate: calc(
				cos(var(--orbit-angle)) * var(--orbit-x) + cos(calc(var(--orbit-angle) * 2)) *
					var(--orbit-x) * 0.15
			)
			calc(
				sin(var(--orbit-angle)) * var(--orbit-y) + sin(calc(var(--orbit-angle) * 3)) *
					var(--orbit-y) * 0.12
			);
	}

	.symbol svg {
		display: block;
		width: 100%;
		height: 100%;
		shape-rendering: crispEdges;
	}

	.symbol-hash {
		left: 24%;
		top: 24%;
		width: min(26vw, 26svh, 27.5rem);
		color: var(--color-secondary);
		animation: symbol-orbit 54s linear -13s infinite;
	}

	.symbol-hash svg {
		rotate: -15deg;
	}

	.symbol-at {
		left: 76%;
		top: 76%;
		width: min(30vw, 30svh, 28.75rem);
		color: var(--color-accent);
		animation: symbol-orbit 77s linear -31s infinite reverse;
	}

	.symbol-at svg {
		rotate: 12deg;
	}

	.symbol-dollar {
		left: 78%;
		top: 22%;
		width: min(16vw, 16svh, 9.375rem);
		color: var(--color-secondary);

		--orbit-x: 3vw;
		--orbit-y: 4svh;

		animation: symbol-orbit 63s linear -22s infinite;
	}

	.symbol-dollar svg {
		rotate: 15deg;
	}

	@keyframes symbol-orbit {
		from {
			--orbit-angle: 0deg;
		}

		to {
			--orbit-angle: 360deg;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.symbol {
			animation: none;
		}
	}
</style>
