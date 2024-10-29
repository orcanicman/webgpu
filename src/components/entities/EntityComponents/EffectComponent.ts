import { Component } from "../../../types/ECS";

export type Effect = "teleport" | "speed";

export class EffectComponent implements Component {
	readonly type = "effect";

	constructor(
		public providers: Effect[] = [],
		public consumers: Effect[] = [],
	) {}

	public addUniqueProvider = (effect: Effect) => {
		if (this.providers.includes(effect)) return;
		this.providers.push(effect);
	};

	public addUniqueConsumer = (effect: Effect) => {
		if (this.consumers.includes(effect)) return;
		this.consumers.push(effect);
	};

	public removeProviderEffect = (effect: Effect) => {
		const providers = this.providers.filter((compEffect) => compEffect !== effect);
		this.providers = providers;
	};

	public removeConsumerEffect = (effect: Effect) => {
		const consumers = this.consumers.filter((compEffect) => compEffect !== effect);
		this.consumers = consumers;
	};
}