import { Component, Entity } from "../types/ECS";

export const getComponent = <T extends Component>(entity: Entity, type: Component["type"]) => {
	return entity.components.find((component) => component.type === type) as T | undefined;
};
