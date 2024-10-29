import { Texture } from "../../../utils/Texture";

/**
 * Loads in textures that will be used.
 */
export class Content {
	public static textures: {
		uvTestTexture: Texture;
		playerTexture: Texture;
		redTexture: Texture;
		blueTexture: Texture;
		redHitbox: Texture;
		brownBrick: Texture;
		blueArrow: Texture;
		purplePortal: Texture;
		cobbleBrick: Texture;
		cobbleBrickLight: Texture;
	};

	public static animationSheets: {
		playerAnimationSheet: Texture;
	};

	public static async initialize(device: GPUDevice) {
		console.log("Render system initialized.");
		this.textures = {
			playerTexture: await Texture.createTextureFromURL(device, "/assets/transparent_16x16.png"),
			redHitbox: await Texture.createTextureFromURL(device, "/assets/red_hitbox.png"),
			redTexture: await Texture.createTextureFromURL(device, "/assets/red_16x32.png"),
			blueTexture: await Texture.createTextureFromURL(device, "/assets/blue_16x16.png"),
			uvTestTexture: await Texture.createTextureFromURL(device, "/assets/uv_test.png"),
			brownBrick: await Texture.createTextureFromURL(device, "/assets/brown_brick_16x16.png"),
			blueArrow: await Texture.createTextureFromURL(device, "/assets/Arrow.png"),
			purplePortal: await Texture.createTextureFromURL(device, "/assets/Portal_16x32.png"),
			cobbleBrick: await Texture.createTextureFromURL(device, "/assets/cobble_16x16.png"),
			cobbleBrickLight: await Texture.createTextureFromURL(device, "/assets/cobble_light_16x16.png"),
		};

		this.animationSheets = {
			playerAnimationSheet: await Texture.createTextureFromURL(
				device,
				"/assets/Prototype-character/AnimationSheet.png",
			),
		};
	}
}
