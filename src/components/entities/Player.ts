import { playerAnimationSheetDescriptor } from "../../helpers/SpriteSheetDescriptors";
import { DefaultEntity } from "./Entities";
import {
	PositionComponent,
	DimensionsComponent,
	VelocityComponent,
	ControllableComponent,
	GravityComponent,
	ColliderComponent,
	CameraFocusComponent,
	SpriteComponent,
	AnimationComponent,
} from "./EntityComponents";

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
			new SpriteComponent("redHitbox"),
			new AnimationComponent(
				playerAnimationSheetDescriptor,
				250,
				playerAnimationSheetDescriptor.animations.find((animation) => animation.name === "idle")!,
			),
		]);
	}
}
