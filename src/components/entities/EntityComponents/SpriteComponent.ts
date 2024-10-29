import { Component } from "../../../types/ECS";
import { Content } from "../../systems/RenderSystem/Content";

export class SpriteComponent implements Component {
	readonly type = "sprite";
	constructor(
		public textures: {
			source: keyof (typeof Content)["textures"];
			// we can add additional stuff like drawwidth etc. UV coords idk
		}[],
	) {}
}
