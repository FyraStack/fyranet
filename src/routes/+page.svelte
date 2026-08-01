<script lang="ts">
	import LocationsPanel from '$lib/components/locations-panel.svelte';
	import type { Location } from '$lib/locations';

	const locations: Location[] = [
		{
			id: 'us-chi-1',
			code: 'us-chi-1',
			label: 'Chicago, IL | CoreSite CH2',
			longitude: -87.6318,
			latitude: 41.8765,
			facility: 'CoreSite CH2',
			city: 'Chicago, IL',
			ix: 'DE-CIX Chicago · 10G',
			ixIps: ['149.112.11.29', '2001:504:102:0:6:2374:0:1'],
			routeServer: true,
			upstreams: [{ name: 'Hurricane Electric', asn: 6939 }],
			lookingGlass: 'https://lg.chi1.fyra.network'
		},
		{
			id: 'us-lax-1',
			code: 'us-lax-1',
			label: 'Los Angeles, CA',
			longitude: -118.2551,
			latitude: 34.0479,
			facility: '',
			city: 'Los Angeles, CA',
			ix: '',
			ixIps: [],
			routeServer: false,
			upstreams: [],
			lookingGlass: null,
			soon: true
		}
	];

	const prefixes = [
		{ prefix: '23.155.252.0/24', family: 'IPv4' },
		{ prefix: '144.225.80.0/23', family: 'IPv4' },
		{ prefix: '2602:f41f:1::/48', family: 'IPv6' },
		{ prefix: '2602:f41f:10::/48', family: 'IPv6' }
	] as const;
</script>

<svelte:head>
	<link rel="preconnect" href="https://tiles.openfreemap.org" crossorigin="anonymous" />
	<link
		rel="preload"
		href="https://tiles.openfreemap.org/styles/dark"
		as="fetch"
		crossorigin="anonymous"
	/>
</svelte:head>

<main class="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
	<header class="mb-10">
		<h1 class="sr-only">Fyra Stack network | AS402292</h1>
		<a
			href="https://fyrastack.com"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-2"
		>
			<img src="/logo.svg" alt="" class="size-6 shrink-0" width="24" height="24" />
			<span class="text-lg font-semibold tracking-tight text-fyra-gray-50">Fyra Stack</span>
		</a>
		<p class="mt-1 font-mono text-base text-fyra-gray-500 sm:text-sm">AS402292</p>
	</header>

	<article class="space-y-10 text-base text-fyra-gray-300 sm:text-sm">
		<section>
			<h2 class="text-base font-semibold text-fyra-gray-50 sm:text-sm">Overview</h2>
			<p class="mt-3 max-w-[65ch] text-pretty">
				Our network carries traffic for our VPS and colocation customers. Sessions and facilities
				are on our
				<a
					href="https://www.peeringdb.com/net/42060"
					rel="noopener noreferrer"
					class="text-fyra-red-400 hover:underline">PeeringDB</a
				>.
			</p>
			<dl class="mt-4 flex flex-wrap gap-x-8 gap-y-2">
				<div>
					<dt class="inline font-medium text-fyra-gray-50">IRR AS-SET</dt>
					<dd class="inline font-mono text-fyra-gray-400">AS-FYRA</dd>
				</div>
				<div>
					<dt class="inline font-medium text-fyra-gray-50">Peering</dt>
					<dd class="inline text-fyra-gray-400">Open</dd>
				</div>
			</dl>
		</section>

		<section>
			<h2 class="text-base font-semibold text-fyra-gray-50 sm:text-sm">Locations</h2>
			<div class="mt-4">
				<LocationsPanel {locations} />
			</div>
		</section>

		<section>
			<h2 class="text-base font-semibold text-fyra-gray-50 sm:text-sm">Peering policy</h2>
			<p class="mt-3 max-w-[65ch] text-pretty">
				Fyra Stack peers openly. We don't require contracts or traffic ratios. Current sessions and
				facilities are on
				<a
					href="https://www.peeringdb.com/net/42060"
					rel="noopener noreferrer"
					class="text-fyra-red-400 hover:underline">PeeringDB</a
				>.
			</p>
			<p class="mt-3 max-w-[65ch] text-pretty">To peer with us:</p>
			<ul class="mt-2 list-disc space-y-1.5 pl-5">
				<li>Keep an accurate &amp; up-to-date PeeringDB record</li>
				<li>
					Only send traffic to us if it is destined to one of
					<a href="#prefixes" class="text-fyra-red-400 hover:underline">our prefixes</a>
				</li>
				<li>Only announce prefixes you are authorized to originate or transit</li>
				<li>Keep sessions stable</li>
				<li>Maintain an active &amp; responsive NOC &amp; abuse contact</li>
			</ul>
			<dl class="mt-4 flex flex-wrap gap-x-8 gap-y-2">
				<div>
					<dt class="font-medium text-fyra-gray-50">IRR AS-SET</dt>
					<dd class="font-mono text-fyra-gray-400">ARIN::AS-FYRA</dd>
				</div>
				<div>
					<dt class="font-medium text-fyra-gray-50">Max prefixes</dt>
					<dd class="text-fyra-gray-400">20 IPv4 / 20 IPv6 (soft)</dd>
				</div>
			</dl>
			<p class="mt-3 max-w-[65ch] text-pretty">
				MD5 is optional. Peering is best-effort and carries no SLA.
			</p>
			<p class="mt-3 max-w-[65ch] text-pretty">
				To request a session, email
				<a href="mailto:peering@fyrastack.com" class="break-all text-fyra-red-400 hover:underline"
					>peering@fyrastack.com</a
				>
				with your ASN, preferred IX or facility, and PeeringDB link.
			</p>
		</section>

		<section id="prefixes">
			<h2 class="text-base font-semibold text-fyra-gray-50 sm:text-sm">Announced prefixes</h2>
			<div class="-mx-5 mt-4 overflow-x-auto whitespace-nowrap sm:-mx-6">
				<div class="inline-block min-w-full px-5 align-middle sm:px-6">
					<table class="w-full text-left">
						<thead>
							<tr class="border-b border-fyra-gray-800">
								<th
									scope="col"
									class="py-2.5 pr-6 font-medium whitespace-nowrap text-fyra-gray-50 sm:py-2"
									>Prefix</th
								>
								<th
									scope="col"
									class="py-2.5 font-medium whitespace-nowrap text-fyra-gray-50 sm:py-2">Family</th
								>
							</tr>
						</thead>
						<tbody>
							{#each prefixes as row (row.prefix)}
								<tr class="border-b border-fyra-gray-800/60">
									<td class="py-2.5 pr-6 font-mono text-fyra-gray-200 sm:py-2">{row.prefix}</td>
									<td class="py-2.5 text-fyra-gray-400 sm:py-2">{row.family}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</section>

		<section>
			<h2 class="text-base font-semibold text-fyra-gray-50 sm:text-sm">Contact</h2>
			<ul class="mt-3 list-none space-y-2 sm:space-y-1.5" role="list">
				<li class="min-w-0">
					Peering:
					<a
						href="mailto:peering@fyrastack.com"
						class="font-mono break-all text-fyra-red-400 hover:underline">peering@fyrastack.com</a
					>
				</li>
				<li class="min-w-0">
					NOC / abuse:
					<a
						href="mailto:noc@fyrastack.com"
						class="font-mono break-all text-fyra-red-400 hover:underline">noc@fyrastack.com</a
					>
				</li>
				<li>
					Commercial:
					<a
						href="https://fyrastack.com"
						rel="noopener noreferrer"
						class="text-fyra-red-400 hover:underline">fyrastack.com</a
					>
				</li>
			</ul>
		</section>
	</article>

	<footer class="mt-14 border-t border-fyra-gray-800 pt-6 text-base text-fyra-gray-500 sm:text-sm">
		<p>
			<a
				href="https://www.peeringdb.com/net/42060"
				rel="noopener noreferrer"
				class="hover:text-fyra-gray-300">PeeringDB</a
			>
			·
			<a
				href="https://bgp.he.net/AS402292"
				rel="noopener noreferrer"
				class="hover:text-fyra-gray-300">bgp.he.net</a
			>
		</p>
		<p class="mt-2">© {new Date().getFullYear()} Fyra Stack Limited</p>
	</footer>
</main>
