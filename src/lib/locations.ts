export type Upstream = {
	name: string;
	asn: number;
};

export type Location = {
	id: string;
	code: string;
	label: string;
	longitude: number;
	latitude: number;
	facility: string;
	city: string;
	ix: string;
	ixIps: string[];
	routeServer: boolean;
	upstreams: Upstream[];
	lookingGlass: string | null;
	/** When true, location is announced but not yet live. */
	soon?: boolean;
};
