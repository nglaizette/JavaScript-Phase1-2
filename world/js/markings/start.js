class Start extends Marking {
	constructor(center, directionVector, width, height){
		super(center, directionVector, width, height);

		this.img = new Image();
		this.img.src = 'car.png';

		this.type = "start";
	}

	draw(ctx) {

		ctx.save();
		ctx.translate(this.center.x, this.center.y);
		ctx.rotate(angle(this.directionVector) - Math.PI / 2.0);
		ctx.drawImage(this.img, -this.img.width / 2.0, -this.img.height / 2.0);
		ctx.restore();

	}
}