class Marking {
	constructor(center, directionVector, width, height){
		this.center = center;
		this.directionVector = directionVector;
		this.width = width;
		this.height = height;

		this.support = new Segment(
			translate(center, angle(directionVector), height / 2),
			translate(center, angle(directionVector), -height / 2)
		)

		this.polygon = new Envelope(this.support, width, 0).polygon;

		this.type = "marking";
	}

	static load(info) {

		const center = new Point(info.center.x, info.center.y);
		const dir = new Point(info.directionVector.x, info.directionVector.y);
		switch (info.type){
			case "crossing":
				return new Crossing(center,dir,info.width,info.height);
			case "light":
				return new Light(center,dir,info.width,info.height);
			case "yield":
				return new Yield(center,dir,info.width,info.height);
			case "start":
				return new Start(center,dir,info.width,info.height);
			case "stop":
				return new Stop(center,dir,info.width,info.height);
			case "parking":
				return new Parking(center,dir,info.width,info.height);
			case "target":
				return new Target(center,dir,info.width,info.height);
			case "marking":
					return new Marking(center,dir,info.width,info.height);
		}
	}

	draw(ctx) {
		this.polygon.draw(ctx);
	}
}