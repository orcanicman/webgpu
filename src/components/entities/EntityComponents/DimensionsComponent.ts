import { Dimensions2D } from "../../../types/Dimensions2D";
import { Component } from "../../../types/ECS";

export class DimensionsComponent implements Component {
	readonly type = "dimensions";
	constructor(public dimensions: Dimensions2D) {}
}
