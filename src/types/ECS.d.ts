export type Component = {
	type: "position" | "dimensions" | "velocity" | "controllable" | "gravity" | "collider" | "sprite";
};

export type Entity = {
	id: string;
	components: Component[];
};

export type System = {
	initialize: () => Promise<void>;
	update: (timePassed: number, entities: Entity[]) => void;
};
