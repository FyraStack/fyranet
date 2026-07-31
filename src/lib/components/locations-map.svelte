<script lang="ts">
	import { Map, MapMarker, MarkerContent } from '$lib/components/ui/map';
	import FlyToLocation from '$lib/components/fly-to-location.svelte';
	import type { Location } from '$lib/locations';

	let {
		locations,
		selectedId,
		hoveredId = $bindable(null),
		flyTarget,
		onselect,
		map = $bindable(null),
		center,
		zoom
	}: {
		locations: Location[];
		selectedId: string | null;
		hoveredId?: string | null;
		flyTarget: { longitude: number; latitude: number; zoom: number } | null;
		onselect: (id: string) => void;
		map?: import('maplibre-gl').Map | null;
		center: [number, number];
		zoom: number;
	} = $props();

	const mapStyles = {
		dark: 'https://tiles.openfreemap.org/styles/dark',
		light: 'https://tiles.openfreemap.org/styles/liberty'
	};
</script>

<Map
	bind:map
	theme="dark"
	styles={mapStyles}
	{center}
	{zoom}
	class="absolute inset-0"
	options={{ attributionControl: { compact: true } }}
>
	{#if flyTarget}
		<FlyToLocation
			longitude={flyTarget.longitude}
			latitude={flyTarget.latitude}
			zoom={flyTarget.zoom}
			active={true}
		/>
	{/if}

	{#each locations as loc (loc.id)}
		<MapMarker
			longitude={loc.longitude}
			latitude={loc.latitude}
			label={loc.soon ? undefined : loc.label}
			onclick={loc.soon ? undefined : () => onselect(loc.id)}
			onmouseenter={loc.soon ? undefined : () => (hoveredId = loc.id)}
			onmouseleave={loc.soon ? undefined : () => (hoveredId = null)}
			onfocus={loc.soon ? undefined : () => (hoveredId = loc.id)}
			onblur={loc.soon ? undefined : () => (hoveredId = null)}
		>
			<MarkerContent class="p-1.5">
				<div
					class={[
						'size-3.5 rounded-full border-2 shadow-md transition-[transform,background-color,border-color] motion-reduce:transition-none sm:size-3',
						loc.soon
							? 'border-fyra-red-500/50 bg-transparent'
							: selectedId === loc.id || hoveredId === loc.id
								? 'scale-125 border-fyra-gray-50 bg-fyra-red-400'
								: 'border-fyra-gray-50 bg-fyra-red-600'
					]}
					title={loc.soon ? `${loc.label} (coming soon)` : undefined}
				></div>
			</MarkerContent>
		</MapMarker>
	{/each}
</Map>
