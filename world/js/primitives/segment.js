class Segment {
	constructor(p1, p2) {
		this.point1 = p1;
		this.point2 = p2;
	}

	length(){
		return distance(this.point1, this.point2);
	}

	directionVector(){
		return normalize(substract(this.point2, this.point1));
	}

	equals(segment) {
		return this.includes(segment.point1) && this.includes(segment.point2);
	}

	/** vérification si un point est inclus dans le segment */
	includes(point){
		return this.point1.equals(point) || this.point2.equals(point);
	}

	distanceToPoint(point){
		const proj = this.projectPoint(point);
		if(proj.offset > 0 && proj.offset < 1){
			return distance(point, proj.point);
		}

		const distToP1 = distance(point, this.point1);
		const distToP2 = distance(point, this.point2);

		return Math.min(distToP1, distToP2);
		}

	projectPoint(point){
		const a = substract(point, this.point1);
		const b = substract(this.point2, this.point1);
		const normB = normalize(b);
		const scaler = dot(a, normB);
		const proj = {
			point: add(this.point1, scale(normB, scaler)),
			offset: scaler / magnitude(b),
		};

		return proj;
	}

	draw(ctx, {width = 2, color = "black", dash = [], cap = "butt"} = {}) {
		ctx.beginPath();
		ctx.lineWidth = width;
		ctx.strokeStyle = color;
		ctx.lineCap = cap;
		ctx.setLineDash(dash);
		ctx.moveTo(this.point1.x, this.point1.y);
		ctx.lineTo(this.point2.x, this.point2.y);
		ctx.stroke();
		ctx.setLineDash([]);
	}
}