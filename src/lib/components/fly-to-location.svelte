<script lang="ts">
	import { useMap } from '$lib/components/ui/map';

	let {
		longitude,
		latitude,
		zoom = 11,
		active = false
	}: {
		longitude: number;
		latitude: number;
		zoom?: number;
		active?: boolean;
	} = $props();

	const mapCtx = useMap();

	$effect(() => {
		const map = mapCtx.map;
		if (!map || !active) return;
		map.flyTo({
			center: [longitude, latitude],
			zoom,
			duration: 800
		});
	});
</script>
