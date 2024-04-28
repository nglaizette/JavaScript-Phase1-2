class Polygon {
	constructor(points){
		this.points = points;
		this.segments = [];

		for(let i = 1; i <= points.length; i++){
			this.segments.push(
				new Segment(points[i - 1], points[i % points.length])
			);
		}
	}

	static load(info) {
		return new Polygon(
			info.points.map((p) => new Point(p.x, p.y))
		);
	}

	static union(polygons){
		Polygon.multiBreak(polygons);
		const keptSegments = [];
		for(let i = 0; i < polygons.length; i++){
			for(const segment of polygons[i].segments){
				let keep = true;
				for(let j = 0; j < polygons.length; j++){
					if( i != j){
						if(polygons[j].containsSegment(segment)){
							keep = false;
							break;
						}
					}
				}

				if(keep){
					keptSegments.push(segment);
				}
			}
		}
		return keptSegments;
	}

	static multiBreak(polygons){
		for(let i = 0; i < polygons.length - 1; i++){
			for(let j = i + 1; j < polygons.length; j++){
				this.break(polygons[i], polygons[j]);
			}
		}
	}

	static break(polygon1, polygon2){
		const segment1 = polygon1.segments;
		const segment2 = polygon2.segments;

		for(let i = 0; i  < segment1.length; i++){
			for(let j = 0; j < segment2.length; j++){
				const intersection = getIntersection(
					segment1[i].point1, segment1[i].point2, segment2[j].point1, segment2[j].point2
				);

				if(intersection && intersection.offset !=1 && intersection.offset != 0){
					const point = new Point(intersection.x, intersection.y);

					// on coupe les segments qui s'intersectent en deux
					// au point d'intersection
					// on les ajoute dans la liste de segments
					let tempPoint = segment1[i].point2;
					segment1[i].point2 =  point
					segment1.splice(i+1, 0, new Segment(point, tempPoint));

					tempPoint = segment2[j].point2;
					segment2[j].point2 =  point
					segment2.splice(j+1, 0, new Segment(point, tempPoint));

				}
			}
		}
	}

	distanceToPoint(point){
		return Math.min(...this.segments.map((segment) => segment.distanceToPoint(point)));
	}

	distanceToPolygon(polygon){
		return Math.min(...this.points.map((point) => polygon.distanceToPoint(point)));
	}

	intersectsPolygon(polygon){
		for(let segment1 of this.segments){
			for(let segment2 of polygon.segments){
				if(getIntersection(segment1.point1, segment1.point2, segment2.point1, segment2.point2)){
					return true;
				}
			}
		}
		return false;
	}

	// Achtung! possible que de vérifier le point du mileu est dans le segment
	// ne marche pas dans le cas général, dans notre cas ça fonctionne
	containsSegment(segment){
		const midpoint = averagePoint(segment.point1, segment.point2);
		return this.containsPoint(midpoint);
	}

	// Si le segment point -point très loin coupe un nombre impair 
	//de fois l'enveloppe, alors il est dedans; sinon il est dehors
	containsPoint(point) {
		const farOuterPoint = new Point(-1000, -1000);
		let intersectionNumber = 0;
		for( const segment of this.segments){
			const intersection = getIntersection(farOuterPoint, point, segment.point1, segment.point2);
			if(intersection){
				intersectionNumber++;
			}
		}

		return intersectionNumber % 2 == 1;
	}

	drawSegments(ctx) {
		for(const segment of this.segments){
			segment.draw(ctx, {color: getRandomColor(), width: 5});
		}
	}

	draw(ctx, { stroke = "blue", lineWidth = 2, fill="rgba(0, 0, 255, 0.3)", join = "miter" } = {}) {
		ctx.beginPath();
		ctx.fillStyle = fill;
		ctx.strokeStyle = stroke;
		ctx.lineWidth = lineWidth;
		ctx.lineJoin = join;
		ctx.moveTo(this.points[0].x, this.points[0].y);
		for(let i = 1; i < this.points.length; i++){
			ctx.lineTo(this.points[i].x, this.points[i].y);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		}
}