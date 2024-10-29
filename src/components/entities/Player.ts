import { playerAnimationSheetDescriptor } from "../../helpers/SpriteSheetDescriptors";
import { DefaultEntity } from "./Entities";
import { VelocityComponent } from "./EntityComponents/VelocityComponent";
import { CameraFocusComponent } from "./EntityComponents/CameraFocusComponent";
import { AnimationComponent } from "./EntityComponents/AnimationComponent";
import { SpriteComponent } from "./EntityComponents/SpriteComponent";
import { PositionComponent } from "./EntityComponents/PositionComponent";
import { GravityComponent } from "./EntityComponents/GravityComponent";
import { DimensionsComponent } from "./EntityComponents/DimensionsComponent";
import { ControllableComponent } from "./EntityComponents/ControllableComponent";
import { EffectComponent } from "./EntityComponents/EffectComponent";
import { ColliderComponent } from "./EntityComponents/ColliderComponent";

export class Player extends DefaultEntity {
	constructor(id: string) {
		super(id, [
			new PositionComponent({ x: 200, y: 300 }),
			new DimensionsComponent({ width: 96, height: 96 }),
			new VelocityComponent({ x: 0, y: 0 }, { x: 2000, y: 5000 }),
			new ControllableComponent(10000),
			new GravityComponent(1000),
			new ColliderComponent("dynamic"),
			new CameraFocusComponent(),
			new SpriteComponent([{ source: "redHitbox" }]),
			new EffectComponent(),
			new AnimationComponent(
				playerAnimationSheetDescriptor,
				250,
				playerAnimationSheetDescriptor.animations.find((animation) => animation.name === "idle")!,
			),
		]);
	}
}
