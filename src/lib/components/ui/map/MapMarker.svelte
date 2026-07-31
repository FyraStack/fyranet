<script lang="ts">
	import { getContext, setContext, untrack } from 'svelte';
	import MapLibreGL, { type MarkerOptions } from 'maplibre-gl';

	type Anchor =
		| 'center'
		| 'top'
		| 'bottom'
		| 'left'
		| 'right'
		| 'top-left'
		| 'top-right'
		| 'bottom-left'
		| 'bottom-right';

	interface Props {
		longitude: number;
		latitude: number;
		children?: import('svelte').Snippet;
		label?: string;
		onclick?: (e: MouseEvent) => void;
		onmouseenter?: (e: MouseEvent) => void;
		onmouseleave?: (e: MouseEvent) => void;
		onfocus?: (e: FocusEvent) => void;
		onblur?: (e: FocusEvent) => void;
		ondragstart?: (lngLat: { lng: number; lat: number }) => void;
		ondrag?: (lngLat: { lng: number; lat: number }) => void;
		ondragend?: (lngLat: { lng: number; lat: number }) => void;
		draggable?: boolean;
		anchor?: Anchor;
		offset?: MarkerOptions['offset'];
		rotation?: number;
		pitchAlignment?: MarkerOptions['pitchAlignment'];
		rotationAlignment?: MarkerOptions['rotationAlignment'];
	}

	let {
		longitude,
		latitude,
		children,
		label,
		onclick,
		onmouseenter,
		onmouseleave,
		onfocus,
		onblur,
		ondragstart,
		ondrag,
		ondragend,
		draggable = false,
		anchor = 'center',
		offset,
		rotation,
		pitchAlignment,
		rotationAlignment
	}: Props = $props();

	const mapCtx = getContext<{
		getMap: () => MapLibreGL.Map | null;
		isLoaded: () => boolean;
	}>('map');

	let marker: MapLibreGL.Marker | null = $state(null);
	let markerElement: HTMLDivElement | null = $state(null);
	let isReady = $state(false);
	let isDragging = $state(false);

	// Provide marker context for child components
	setContext('marker', {
		getMarker: () => marker,
		getElement: () => markerElement,
		getMap: () => mapCtx.getMap(),
		isReady: () => isReady,
		isDraggable: () => draggable,
		isDragging: () => isDragging
	});

	// Create marker when map is ready
	$effect(() => {
		const map = mapCtx.getMap();
		const mapLoaded = mapCtx.isLoaded();

		if (!map || !mapLoaded) return;

		// Validate coordinates (untracked — position updates are handled by a separate effect)
		const lng = untrack(() => longitude);
		const lat = untrack(() => latitude);
		if (
			typeof lng !== 'number' ||
			typeof lat !== 'number' ||
			Number.isNaN(lng) ||
			Number.isNaN(lat)
		) {
			return;
		}

		// Create container element programmatically
		const container = document.createElement('div');
		const interactive = untrack(() => !!onclick);
		container.className = interactive ? 'cursor-pointer' : 'pointer-events-none';
		markerElement = container;

		// Build marker options
		const initialDraggable = untrack(() => draggable);
		const initialAnchor = untrack(() => anchor);
		const initialOffset = untrack(() => offset);
		const initialRotation = untrack(() => rotation);
		const initialPitchAlignment = untrack(() => pitchAlignment);
		const initialRotationAlignment = untrack(() => rotationAlignment);
		const markerOptions: MarkerOptions = {
			element: container,
			draggable: initialDraggable,
			anchor: initialAnchor
		};

		if (initialOffset !== undefined) markerOptions.offset = initialOffset;
		if (initialRotation !== undefined) markerOptions.rotation = initialRotation;
		if (initialPitchAlignment !== undefined) markerOptions.pitchAlignment = initialPitchAlignment;
		if (initialRotationAlignment !== undefined) {
			markerOptions.rotationAlignment = initialRotationAlignment;
		}

		// Create and add marker
		const markerInstance = new MapLibreGL.Marker(markerOptions).setLngLat([lng, lat]).addTo(map);

		marker = markerInstance;

		const handleClick = (e: MouseEvent) => onclick?.(e);
		const handleMouseEnter = (e: MouseEvent) => onmouseenter?.(e);
		const handleMouseLeave = (e: MouseEvent) => {
			if (!isDragging) onmouseleave?.(e);
		};
		const handleFocus = (e: FocusEvent) => onfocus?.(e);
		const handleBlur = (e: FocusEvent) => onblur?.(e);
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				container.click();
			}
		};

		container.addEventListener('click', handleClick);
		container.addEventListener('mouseenter', handleMouseEnter);
		container.addEventListener('mouseleave', handleMouseLeave);
		container.addEventListener('focus', handleFocus);
		container.addEventListener('blur', handleBlur);
		container.addEventListener('keydown', handleKeydown);

		// Drag event handlers
		const handleDragStart = () => {
			isDragging = true;
			const lngLat = markerInstance.getLngLat();
			ondragstart?.({ lng: lngLat.lng, lat: lngLat.lat });
		};
		const handleDrag = () => {
			const lngLat = markerInstance.getLngLat();
			ondrag?.({ lng: lngLat.lng, lat: lngLat.lat });
		};
		const handleDragEnd = () => {
			isDragging = false;
			const lngLat = markerInstance.getLngLat();
			ondragend?.({ lng: lngLat.lng, lat: lngLat.lat });
		};

		markerInstance.on('dragstart', handleDragStart);
		markerInstance.on('drag', handleDrag);
		markerInstance.on('dragend', handleDragEnd);

		isReady = true;

		// Cleanup
		return () => {
			container.removeEventListener('click', handleClick);
			container.removeEventListener('mouseenter', handleMouseEnter);
			container.removeEventListener('mouseleave', handleMouseLeave);
			container.removeEventListener('focus', handleFocus);
			container.removeEventListener('blur', handleBlur);
			container.removeEventListener('keydown', handleKeydown);

			markerInstance.off('dragstart', handleDragStart);
			markerInstance.off('drag', handleDrag);
			markerInstance.off('dragend', handleDragEnd);

			markerInstance.remove();
			marker = null;
			markerElement = null;
			isReady = false;
		};
	});

	$effect(() => {
		const el = markerElement;
		if (!el) return;

		if (label === undefined) {
			el.removeAttribute('role');
			el.removeAttribute('aria-label');
			el.removeAttribute('tabindex');
		} else {
			el.setAttribute('role', 'button');
			el.setAttribute('aria-label', label);
			el.tabIndex = 0;
		}
	});

	// Update position when coordinates change
	$effect(() => {
		if (
			marker &&
			typeof longitude === 'number' &&
			typeof latitude === 'number' &&
			!Number.isNaN(longitude) &&
			!Number.isNaN(latitude)
		) {
			marker.setLngLat([longitude, latitude]);
		}
	});

	// Update marker options when props change
	$effect(() => {
		if (!marker) return;

		if (marker.isDraggable() !== draggable) {
			marker.setDraggable(draggable);
		}

		const currentOffset = marker.getOffset();
		const nextOffset = offset ?? [0, 0];
		const [nextOffsetX, nextOffsetY] = Array.isArray(nextOffset)
			? nextOffset
			: [nextOffset.x, nextOffset.y];
		if (currentOffset.x !== nextOffsetX || currentOffset.y !== nextOffsetY) {
			marker.setOffset(nextOffset);
		}

		if (marker.getRotation() !== (rotation ?? 0)) {
			marker.setRotation(rotation ?? 0);
		}
		if (marker.getRotationAlignment() !== (rotationAlignment ?? 'auto')) {
			marker.setRotationAlignment(rotationAlignment ?? 'auto');
		}
		if (marker.getPitchAlignment() !== (pitchAlignment ?? 'auto')) {
			marker.setPitchAlignment(pitchAlignment ?? 'auto');
		}
	});
</script>

<!-- Children are MarkerContent, MarkerPopup, MarkerTooltip -->
{@render children?.()}
