class MiniMap {
	constructor(canvas, graph, size){
		this.canvas = canvas;
		this.graph = graph;
		this.size = size;

		canvas.width = size;
		canvas.height = size;
		this.ctx = canvas.getContext("2d");
	}

	update(viewPoint){
		this.ctx.clearRect(0, 0, this.size, this.size)
		
		this.ctx.save();
		this.ctx.translate(-viewPoint.x, -viewPoint.y);
		for(const segment of this.graph.segments){
			segment.draw(this.ctx);
		}
		this.ctx.restore();
	}
}
