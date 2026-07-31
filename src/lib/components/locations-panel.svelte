<script lang="ts">
	import { tick } from 'svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Check from '@lucide/svelte/icons/check';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	import type { Location } from '$lib/locations';

	let {
		locations,
		selectedId = $bindable<string | null>(null)
	}: {
		locations: Location[];
		selectedId?: string | null;
	} = $props();

	const DETAIL_ZOOM = 11;

	const overview = $derived.by(() => {
		if (locations.length === 0) {
			return { center: [-95, 38] as [number, number], bounds: null };
		}
		const lngs = locations.map((l) => l.longitude);
		const lats = locations.map((l) => l.latitude);
		const west = Math.min(...lngs);
		const east = Math.max(...lngs);
		const south = Math.min(...lats);
		const north = Math.max(...lats);
		return {
			center: [(west + east) / 2, (south + north) / 2] as [number, number],
			bounds: [
				[west, south],
				[east, north]
			] as [[number, number], [number, number]]
		};
	});

	const selected = $derived(locations.find((l) => l.id === selectedId && !l.soon) ?? null);

	let hoveredId = $state<string | null>(null);
	let hasZoomedIn = $state(false);
	let flyTarget = $state<{
		longitude: number;
		latitude: number;
		zoom: number;
	} | null>(null);
	let fitOverviewToken = $state(0);

	$effect(() => {
		if (selected) {
			hasZoomedIn = true;
			flyTarget = {
				longitude: selected.longitude,
				latitude: selected.latitude,
				zoom: DETAIL_ZOOM
			};
		} else if (hasZoomedIn) {
			hasZoomedIn = false;
			flyTarget = null;
			fitOverviewToken += 1;
		}
	});

	let backButton = $state<HTMLButtonElement | null>(null);
	let listNav = $state<HTMLElement | null>(null);
	let lastSelectedId: string | null = null;

	async function selectLocation(id: string) {
		const loc = locations.find((l) => l.id === id);
		if (!loc || loc.soon) return;
		selectedId = id;
		lastSelectedId = id;
		await tick();
		backButton?.focus();
	}

	function fitOverview(map: import('maplibre-gl').Map, duration = 0) {
		const bounds = overview.bounds;
		if (!bounds) return;
		map.fitBounds(bounds, {
			padding: { top: 56, bottom: 56, left: 56, right: 56 },
			maxZoom: 4,
			duration
		});
	}

	async function clearSelection() {
		selectedId = null;
		await tick();
		const previous = lastSelectedId
			? listNav?.querySelector<HTMLButtonElement>(
					`button[data-location-id="${lastSelectedId}"]:not(:disabled)`
				)
			: null;
		(previous ?? listNav?.querySelector<HTMLButtonElement>('button:not(:disabled)'))?.focus();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && selectedId) clearSelection();
	}

	let LocationsMap = $state<typeof import('./locations-map.svelte').default | null>(null);
	let mapInstance = $state<import('maplibre-gl').Map | null>(null);
	let mapPane = $state<HTMLDivElement | null>(null);

	$effect(() => {
		const pane = mapPane;
		if (!pane || LocationsMap) return;

		const load = () => import('./locations-map.svelte').then((m) => (LocationsMap = m.default));

		if (!('IntersectionObserver' in window)) {
			load();
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					observer.disconnect();
					load();
				}
			},
			{ rootMargin: '400px' }
		);
		observer.observe(pane);

		return () => observer.disconnect();
	});

	$effect(() => {
		const map = mapInstance;
		const pane = mapPane;
		if (!map || !pane) return;

		const resize = () => map.resize();
		const collapseAttribution = () => {
			const attrib = map.getContainer().querySelector('.maplibregl-ctrl-attrib');
			attrib?.classList.remove('maplibregl-compact-show');
		};
		const onLoad = () => {
			collapseAttribution();
			if (!selectedId) fitOverview(map);
		};

		resize();
		collapseAttribution();
		if (map.loaded()) onLoad();
		else map.once('load', onLoad);

		const observer = new ResizeObserver(resize);
		observer.observe(pane);

		return () => {
			observer.disconnect();
			map.off('load', onLoad);
		};
	});

	$effect(() => {
		const map = mapInstance;
		const token = fitOverviewToken;
		if (!map || selectedId) return;
		if (token === 0 && !map.loaded()) return;
		fitOverview(map, token > 0 ? 800 : 0);
	});
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="flex h-[25rem] flex-col overflow-hidden rounded-md border border-fyra-gray-800 sm:h-[29rem] sm:flex-row"
>
	<aside
		class={[
			'flex min-h-0 flex-col border-fyra-gray-800 sm:w-56 sm:shrink-0 sm:border-r sm:border-b-0 lg:w-64',
			selected
				? 'max-h-[45%] shrink-0 border-b sm:max-h-none'
				: 'max-h-[50%] border-b sm:max-h-none sm:border-b-0'
		]}
		aria-label="Locations"
	>
		{#if selected}
			<div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 sm:p-3">
				<button
					type="button"
					bind:this={backButton}
					class="group relative mb-3 -ml-1 inline-flex items-center gap-1.5 rounded-sm px-1 py-1 text-base text-fyra-gray-400 hover:bg-fyra-gray-900 hover:text-fyra-gray-50 sm:py-0.5 sm:text-sm"
					onclick={clearSelection}
				>
					<ArrowLeft
						class="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none sm:size-3.5"
						aria-hidden="true"
					/>
					<span>Locations</span>
					<span
						class="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
						aria-hidden="true"
					></span>
				</button>

				<div class="min-w-0">
					<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
						<h3 class="font-mono text-base font-medium text-fyra-gray-50 sm:text-sm">
							{selected.code}
						</h3>
						{#if selected.soon}
							<span class="text-base text-fyra-gray-500 sm:text-[0.8125rem]">soon</span>
						{/if}
					</div>
					<p class="mt-0.5 text-base text-fyra-gray-400 sm:text-[0.8125rem]">{selected.label}</p>
				</div>

				{#if selected.soon}
					<dl class="mt-4 space-y-3 border-t border-fyra-gray-800/80 pt-4">
						<div>
							<dt class="text-base font-medium text-fyra-gray-50 sm:text-[0.8125rem]">City</dt>
							<dd class="mt-0.5 text-base text-fyra-gray-400 sm:text-[0.8125rem]">{selected.city}</dd>
						</div>
						<div>
							<dt class="text-base font-medium text-fyra-gray-50 sm:text-[0.8125rem]">Status</dt>
							<dd class="mt-0.5 text-base text-fyra-gray-400 sm:text-[0.8125rem]">Coming soon</dd>
						</div>
					</dl>
				{:else}
					<dl class="mt-4 space-y-3 border-t border-fyra-gray-800/80 pt-4">
						{#if selected.facility}
							<div>
								<dt class="text-base font-medium text-fyra-gray-50 sm:text-[0.8125rem]">Facility</dt>
								<dd class="mt-0.5 text-base text-fyra-gray-400 sm:text-[0.8125rem]">
									{selected.facility}
								</dd>
							</div>
						{/if}
						<div>
							<dt class="text-base font-medium text-fyra-gray-50 sm:text-[0.8125rem]">City</dt>
							<dd class="mt-0.5 text-base text-fyra-gray-400 sm:text-[0.8125rem]">{selected.city}</dd>
						</div>
						{#if selected.ix}
							<div>
								<dt class="text-base font-medium text-fyra-gray-50 sm:text-[0.8125rem]">IX</dt>
								<dd class="mt-0.5 text-base text-fyra-gray-400 sm:text-[0.8125rem]">{selected.ix}</dd>
								{#if selected.routeServer}
									<dd
										class="mt-1.5 inline-flex items-center gap-1.5 text-base text-fyra-gray-400 sm:text-[0.8125rem]"
									>
										<Check class="size-4 shrink-0 sm:size-3.5" aria-hidden="true" />
										<span>Route Server</span>
									</dd>
								{/if}
								{#each selected.ixIps as ip (ip)}
									<dd
										class="mt-1 font-mono text-base leading-relaxed break-all text-fyra-gray-500 sm:text-sm"
									>
										{ip}
									</dd>
								{/each}
							</div>
						{/if}
						{#if selected.upstreams.length > 0}
							<div>
								<dt class="text-base font-medium text-fyra-gray-50 sm:text-[0.8125rem]">Upstreams</dt>
								{#each selected.upstreams as upstream (upstream.asn)}
									<dd class="mt-0.5 text-base text-fyra-gray-400 sm:text-[0.8125rem]">
										{upstream.name}
										<span class="font-mono text-fyra-gray-500"> AS{upstream.asn}</span>
									</dd>
								{/each}
							</div>
						{/if}
						{#if selected.lookingGlass}
							<div>
								<dt class="text-base font-medium text-fyra-gray-50 sm:text-[0.8125rem]">
									Looking glass
								</dt>
								<dd class="mt-0.5 min-w-0">
									<a
										href={selected.lookingGlass}
										rel="noopener noreferrer"
										class="font-mono text-base break-all text-fyra-red-400 hover:underline sm:text-sm"
										>{selected.lookingGlass.replace(/^https?:\/\//, '')}</a
									>
								</dd>
							</div>
						{/if}
					</dl>
				{/if}
			</div>
		{:else}
			<nav bind:this={listNav} class="min-h-0 flex-1 overflow-y-auto" aria-label="Location list">
				<ul class="divide-y divide-fyra-gray-800/80" role="list">
					{#each locations as loc (loc.id)}
						<li>
							<button
								type="button"
								data-location-id={loc.id}
								disabled={loc.soon}
								aria-disabled={loc.soon ? true : undefined}
								aria-label={loc.soon ? `${loc.code}, coming soon` : undefined}
								class={[
									'group flex w-full items-start gap-2 border-l-2 px-3 py-3.5 text-left transition-colors motion-reduce:transition-none sm:py-3',
									loc.soon
										? 'cursor-not-allowed border-transparent opacity-60'
										: hoveredId === loc.id
											? 'border-fyra-red-500/70 bg-fyra-gray-900 text-fyra-gray-50'
											: 'border-transparent text-fyra-gray-300 hover:border-fyra-red-500/50 hover:bg-fyra-gray-900/70 hover:text-fyra-gray-50'
								]}
								onmouseenter={() => {
									if (!loc.soon) hoveredId = loc.id;
								}}
								onmouseleave={() => {
									if (!loc.soon) hoveredId = null;
								}}
								onfocus={() => {
									if (!loc.soon) hoveredId = loc.id;
								}}
								onblur={() => {
									if (!loc.soon) hoveredId = null;
								}}
								onclick={() => selectLocation(loc.id)}
							>
								<span class="min-w-0 flex-1">
									<span
										class={[
											'block font-mono text-base font-medium sm:text-sm',
											loc.soon ? 'text-fyra-gray-400' : 'text-fyra-gray-50'
										]}>{loc.code}</span
									>
									<span
										class={[
											'mt-0.5 block text-base sm:text-[0.8125rem]',
											loc.soon ? 'text-fyra-gray-600' : 'text-fyra-gray-400'
										]}>{loc.label}</span
									>
								</span>
								{#if loc.soon}
									<span
										class="mt-0.5 shrink-0 text-base font-medium tracking-wide text-fyra-red-400 sm:text-[0.8125rem]"
										>soon</span
									>
								{:else}
									<ChevronRight
										class="mt-0.5 size-5 shrink-0 text-fyra-gray-600 transition-colors group-hover:text-fyra-gray-400 motion-reduce:transition-none sm:size-4"
										aria-hidden="true"
									/>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</nav>
		{/if}
	</aside>

	<div bind:this={mapPane} class="relative min-h-0 min-w-0 flex-1 bg-fyra-gray-950">
		{#if LocationsMap}
			<LocationsMap
				{locations}
				{selectedId}
				bind:hoveredId
				{flyTarget}
				onselect={selectLocation}
				bind:map={mapInstance}
				center={[...overview.center]}
				zoom={2.5}
			/>
		{:else}
			<div class="absolute inset-0 flex items-center justify-center" role="status">
				<span class="sr-only">Loading map</span>
				<div class="flex gap-1" aria-hidden="true">
					<span
						class="size-1.5 animate-pulse rounded-full bg-fyra-gray-500/60 motion-reduce:animate-none"
					></span>
					<span
						class="size-1.5 animate-pulse rounded-full bg-fyra-gray-500/60 [animation-delay:150ms] motion-reduce:animate-none"
					></span>
					<span
						class="size-1.5 animate-pulse rounded-full bg-fyra-gray-500/60 [animation-delay:300ms] motion-reduce:animate-none"
					></span>
				</div>
			</div>
		{/if}
	</div>
</div>
