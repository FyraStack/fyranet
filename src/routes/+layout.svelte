<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>AS402292 | Fyra Stack Limited</title>
	<meta
		name="description"
		content="Fyra Stack network AS402292 | peering policy, locations, looking glass"
	/>
	<meta property="og:title" content="AS402292 · Fyra Stack" />
	<meta
		property="og:description"
		content="Infrastructure network for VPS and colocation."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://fyra.network/" />
	<meta property="og:image" content="https://fyra.network/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Fyra Stack | AS402292 | open peering" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href="https://fyra.network/" />
</svelte:head>

{@render children?.()}
