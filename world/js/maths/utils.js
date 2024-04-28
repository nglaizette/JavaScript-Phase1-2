function getNearestPoint(location, points, threshold = Number.MAX_SAFE_INTEGER) {
	let minDistance = Number.MAX_SAFE_INTEGER;
	let nearestPoint = null;

	for(const point of points) {
		const dist = distance(point, location);
		if (dist < minDistance && dist < threshold) {
			minDistance = dist;
			nearestPoint = point;
		}
	}
	return nearestPoint;
}

function getNearestSegment(location, segments, threshold = Number.MAX_SAFE_INTEGER) {
	let minDistance = Number.MAX_SAFE_INTEGER;
	let nearestSegment = null;

	for(const segment of segments) {
		const dist = segment.distanceToPoint(location);
		if (dist < minDistance && dist < threshold) {
			minDistance = dist;
			nearestSegment = segment;
		}
	}
	return nearestSegment;
}

function distance(point1, point2) {
	return Math.hypot(point1.x - point2.x, point1.y - point2.y);
}

function averagePoint(point1, point2) {
	return new Point((point1.x + point2.x)/ 2.0, (point1.y + point2.y)/ 2.0);
}

function dot(point1, point2){
	return point1.x * point2.x + point1.y * point2.y;
}

function add(point1, point2){
	return new Point(point1.x + point2.x, point1.y + point2.y);
}

function substract(point1, point2){
	return new Point(point1.x - point2.x, point1.y - point2.y);
}

function scale(point, scaler){
	return new Point( point.x * scaler, point.y * scaler);
}

function normalize(vector){
	return scale(vector, 1/ magnitude(vector));
}

function magnitude(vector){
	return Math.hypot(vector.x, vector.y);
}

function perpendicular(vector) {
	return new Point(-vector.y, vector.x);
}

function translate(loc, angle, offset) {
	return new Point(
		loc.x + Math.cos(angle) * offset,
		loc.y + Math.sin(angle) * offset
	);
}

function angle(point){
	return Math.atan2(point.y, point.x);
}

function getIntersection(A, B, C, D){
	const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
	const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
	const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

	const epsilon = 0.001;
	if ( Math.abs(bottom) > epsilon ){
		const t = tTop / bottom;
		const u = uTop / bottom;
		if( t >= 0 && t <= 1 && u >= 0 && u <= 1){
			return {
				x: lerp(A.x, B.x, t),
				y: lerp(A.y, B.y, t),
				offset: t,
			};
		}
	}

	return null;
}

function lerp(a, b, t) {
	return a + (b - a) * t;
}

function lerp2D(A, B, t){
	return new Point(
		lerp(A.x, B.x, t),
		lerp(A.y, B.y, t)
	);
}

function getRandomColor(){
	const hue = 290 + Math.random() * 260;
	return "hsl(" + hue + ", 100%, 60%)";
}

function getFake3dPoint(point, viewPoint, height){
	const direction = normalize(substract(point, viewPoint));
	const dist = distance(point, viewPoint);
	const scaler = Math.atan( dist / 300) / (Math.PI / 2.0);
	return add(point, scale(direction, height * scaler));
}