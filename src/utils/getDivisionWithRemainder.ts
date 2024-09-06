export const getFlooredDivisionWithRemainder = (value: number, divideBy: number) => {
	const flooredDivision = Math.floor(value / divideBy);
	const remainder = value % divideBy;
	return { flooredDivision, remainder };
};

export const getPositionValues2d = (totalWidth: number, stepSize: number, steps: number) => {
	const { target, iteration } = howDeep(totalWidth, stepSize * steps, 0);
	return { x: target, y: iteration * stepSize };
};

const howDeep = (maxValue: number, target: number, iteration: number) => {
	const newValue = maxValue - target;
	if (newValue <= 0) return howDeep(maxValue, newValue * -1, iteration + 1);

	return { target, iteration };
};
