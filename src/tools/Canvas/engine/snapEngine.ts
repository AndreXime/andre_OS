export interface Bounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface SnapGuide {
	orientation: "h" | "v";
	position: number;
}

export interface SnapResult {
	x: number;
	y: number;
	guides: SnapGuide[];
}

interface EdgeTarget {
	value: number;
	kind: "v" | "h";
}

function edgesOf(bounds: Bounds): { vertical: number[]; horizontal: number[] } {
	return {
		vertical: [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width],
		horizontal: [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height],
	};
}

export function computeSnap(
	moving: Bounds,
	others: Bounds[],
	canvas: { width: number; height: number },
	threshold = 5,
): SnapResult {
	const targets: EdgeTarget[] = [
		{ value: 0, kind: "v" },
		{ value: canvas.width / 2, kind: "v" },
		{ value: canvas.width, kind: "v" },
		{ value: 0, kind: "h" },
		{ value: canvas.height / 2, kind: "h" },
		{ value: canvas.height, kind: "h" },
	];

	for (const other of others) {
		const e = edgesOf(other);
		for (const value of e.vertical) targets.push({ value, kind: "v" });
		for (const value of e.horizontal) targets.push({ value, kind: "h" });
	}

	const movingEdges = edgesOf(moving);
	let bestDx: number | null = null;
	let bestDy: number | null = null;
	let guideV: number | null = null;
	let guideH: number | null = null;

	for (const edge of movingEdges.vertical) {
		for (const target of targets) {
			if (target.kind !== "v") continue;
			const dx = target.value - edge;
			if (Math.abs(dx) > threshold) continue;
			if (bestDx === null || Math.abs(dx) < Math.abs(bestDx)) {
				bestDx = dx;
				guideV = target.value;
			}
		}
	}

	for (const edge of movingEdges.horizontal) {
		for (const target of targets) {
			if (target.kind !== "h") continue;
			const dy = target.value - edge;
			if (Math.abs(dy) > threshold) continue;
			if (bestDy === null || Math.abs(dy) < Math.abs(bestDy)) {
				bestDy = dy;
				guideH = target.value;
			}
		}
	}

	const guides: SnapGuide[] = [];
	if (guideV !== null) guides.push({ orientation: "v", position: guideV });
	if (guideH !== null) guides.push({ orientation: "h", position: guideH });

	return {
		x: moving.x + (bestDx ?? 0),
		y: moving.y + (bestDy ?? 0),
		guides,
	};
}
