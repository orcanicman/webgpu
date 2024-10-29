import { Component } from "../../../types/ECS";
import { Content } from "../../systems/RenderSystem/Content";

export class SpriteComponent implements Component {
	readonly type = "sprite";
	constructor(public source: keyof (typeof Content)["textures"]) {}
}
