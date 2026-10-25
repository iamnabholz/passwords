<script lang="ts">
	import '../styles/style.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const siteName = 'Passwords';
	const siteUrl = 'https://passwords.nabholz.work/';
	const title = 'Passwords — Questionable Password Generator';
	const description =
		'Generate ridiculous passwords from questionable vocabulary. Create and copy a new password instantly, right in your browser.';

	const socialImage = new URL('social-preview.png', siteUrl).href;
	const socialImageAlt =
		'Passwords: a pink hash logo on cyan, with the tagline A funny password generator. Made by Lukas Nabholz.';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<meta name="robots" content="index, follow, max-image-preview:large" />
	<link rel="canonical" href={siteUrl} />

	<meta name="theme-color" content="#fdc800" />
	<meta name="color-scheme" content="light" />

	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={socialImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={socialImageAlt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={socialImage} />
	<meta name="twitter:image:alt" content={socialImageAlt} />
</svelte:head>

{@render children()}
