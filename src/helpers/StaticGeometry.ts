export class QuadGeometry {
	public vertices: number[];
	public inidices: number[];

	constructor(
		x: number,
		y: number,
		w: number,
		h: number,
		{ u, v }: { u: [number, number, number, number]; v: [number, number, number, number] },
	) {
		/**
		 * FYI, texture coordinates are drawn from the top left.
		 * This is different than the coordinate system i am using.
		 */

		// // prettier-ignore
		// this.vertices = [
		//     // x, y         U, V        R, G, B
		//     x  ,  y  ,      0.0, 1.0,   1.0, 1.0, 1.0,  // Index 0 // top-left
		//     x+w,  y  ,      1.0, 1.0,   1.0, 1.0, 1.0,  // Index 1 // top-right
		//     x+w,  y+h,      1.0, 0.0,   1.0, 1.0, 1.0,  // Index 2 // bottom-right
		//     x  ,  y+h,      0.0, 0.0,   1.0, 1.0, 1.0,  // Index 3 // bottom-left
		// ];

		// prettier-ignore
		this.vertices = [
		    // x, y         U, V          R, G, B
		    x  ,  y  ,      u[0], v[0],   1.0, 1.0, 1.0,  // Index 0 // top-left
		    x+w,  y  ,      u[1], v[1],   1.0, 1.0, 1.0,  // Index 1 // top-right
		    x+w,  y+h,      u[2], v[2],   1.0, 1.0, 1.0,  // Index 2 // bottom-right
		    x  ,  y+h,      u[3], v[3],   1.0, 1.0, 1.0,  // Index 3 // bottom-left
		];

		// prettier-ignore
		this.inidices = [
            0, 1, 2,
            0, 3, 2,
        ];
	}
}
