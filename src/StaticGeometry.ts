export class QuadGeometry {
	public vertices: number[];
	public inidices: number[];

	constructor() {
		const x = 300;
		const y = 250;
		const w = 80;
		const h = 80;

		/**
		 * FYI, texture coordinates are drawn from the top left.
		 * This is different than the coordinate system i am using.
		 */

		// prettier-ignore
		this.vertices = [
            // x, y         U, V        R, G, B
            x  ,  y  ,      0.0, 1.0,   1.0, 1.0, 1.0,  // Index 0
            x+w,  y  ,      1.0, 1.0,   1.0, 1.0, 1.0,  // Index 1
            x+w,  y+h,      1.0, 0.0,   1.0, 1.0, 1.0,  // Index 2
            x  ,  y+h,      0.0, 0.0,   1.0, 1.0, 1.0,  // Index 3
        ];

		// prettier-ignore
		this.inidices = [
            0, 1, 2,
            0, 3, 2,
        ];
	}
}
