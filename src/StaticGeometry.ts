export class QuadGeometry {
	public vertices: number[];
	public inidices: number[];

	constructor() {
		// prettier-ignore
		this.vertices = [
            // x, y         U, V        R, G, B
            -0.5, -0.5,     0.0, 1.0,   1.0, 1.0, 1.0,
            0.5, -0.5,      1.0, 1.0,   1.0, 1.0, 1.0,
            -0.5, 0.5,      0.0, 0.0,   1.0, 1.0, 1.0,
            0.5, 0.5,       1.0, 0.0,   1.0, 1.0, 1.0,
        ];

		// prettier-ignore
		this.inidices = [
            0, 1, 2,
            1, 2, 3,
        ];
	}
}
