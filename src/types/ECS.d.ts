export type Component = {
	type: "position" | "dimensions" | "velocity" | "controllable" | "gravity" | "collider" | "sprite" | "camera_focus";
};

export type Entity = {
	id: string;
	components: Component[];
};

export type System = {
	initialize: () => Promise<void>;
	update: (timePassed: number, entities: Entity[]) => void;
};
