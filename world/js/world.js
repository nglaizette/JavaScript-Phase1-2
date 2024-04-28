class 	World {
	constructor(
		graph,
		roadWidth = 100,
		roadRoundness = 10,
		buildingWidth = 150,
		buildingMinLength = 150,
		spacing = 50,
		treeSize = 160
		) {
			this.graph = graph;
			this.roadWidth = roadWidth;
			this.roadRoundness = roadRoundness;
			this.buildingWidth = buildingWidth;
			this.buildingMinLength = buildingMinLength;
			this.spacing = spacing;
			this.treeSize = treeSize;

			this.envelopes = [];
			this.roadBoarders = [];
			this.buildings = [];
			this.trees = [];
			this.laneGuides = [];

			this.markings = [];

			this.frameCount = 0;

			this.generate();
		}

	static load(info) {
		const world = new World(new Graph);
		world.graph = Graph.load(info.graph);
		world.roadWidth = info.roadWidth;
		world.roadRoundness = info.roadRoundness;
		world.buildingWidth = info.buildingWidth;
		world.buildingMinLength = info.buildingMinLength;
		world.spacing = info.spacing;
		world.treeSize = info.treeSize;

		world.envelopes = info.envelopes.map((e) => Envelope.load(e));
		world.roadBoarders = info.roadBoarders.map((s) => new Segment(s.point1, s.point2));
		world.buildings = info.buildings.map((b) => Building.load(b));
		world.laneGuides = info.laneGuides.map((l) => new Segment(l.point1, l.point2));
		world.trees = info.trees.map((t)=> new Tree(t.center, info.treeSize));
		world.markings = info.markings.map((m) => Marking.load(m));

		world.zoom = info.zoom;
		world.offset = info.offset;
		
		return world;
	};

	generate() {
		this.envelopes.length = 0;
		for(const segment of this.graph.segments) {
			this.envelopes.push(
				new Envelope(segment, this.roadWidth, this.roadRoundness)
			);
		}

		this.roadBoarders= Polygon.union(this.envelopes.map((envelope) => envelope.polygon));
		this.buildings = this.#generateBuildings();
		this.trees = this.#generateTrees();

		this.laneGuides.length = 0;
		this.laneGuides.push(...this.#generateLaneGuides());
	}

	#generateLaneGuides(){
		const tmpEnvelopes = [];
		for(const segment of this.graph.segments){
			tmpEnvelopes.push(
				new Envelope(
					segment,
					this.roadWidth / 2.0,
					this.roadRoundness
				)
			);
		}

		const segments = Polygon.union(tmpEnvelopes.map((envelope)=> envelope.polygon));
		return segments;
	}

	#generateTrees() {
		
		// récupéation de tous les points utilisés
		const points = [
			...this.roadBoarders.map( (segment) => [segment.point1, segment.point2]).flat(),
			...this.buildings.map( (building) => building.base.points).flat(),
		];
 
		const left = Math.min(...points.map((point) => point.x));
		const right = Math.max(...points.map((point) => point.x));
		const top = Math.min(...points.map((point) => point.y));
		const bottom = Math.max(...points.map((point) => point.y));

		// récupéreation de tous les polygones créés
		const illegalPolygons = [
			...this.buildings.map((building) => building.base),
			...this.envelopes.map((envelope) => envelope.polygon),
		];

		const trees = [];
		let tryCount = 0;

		while (tryCount < 100){
			const point = new Point(
				lerp(left, right, Math.random()),
				lerp(bottom, top, Math.random())
			);
			let keep = true;

			// check if tree inside or nearby building / road
			for(const polygon of illegalPolygons){
				if(polygon.containsPoint(point)|| polygon.distanceToPoint(point) < this.treeSize / 2.0){
					keep = false;
					break;
				}
			}

			// check if tree too close to other trees
			if(keep) {
				for(const tree of trees){
					if(distance(tree.center, point) < this.treeSize) {
						keep = false;
						break;
					}
				}
			}

			// Avoiding trees in the middle of nowhere
			if(keep){
				let closeToSomething = false;
				for(const polygon of illegalPolygons){
					if(polygon.distanceToPoint(point) < this.treeSize * 2.0){
						closeToSomething = true;
						break;
					}
				}
				keep = closeToSomething;
			}

			if(keep){
				trees.push(new Tree(point, this.treeSize));
				tryCount = 0;
			}
			tryCount++;
		}
		return trees;
	}

	#generateBuildings(){
		const tmpEnvelopes = [];
		for(const segment of this.graph.segments){
			tmpEnvelopes.push(
				new Envelope(
					segment,
					this.roadWidth + this.buildingWidth + this.spacing * 2,
					this.roadRoundness
				)
			);
		}

		const guides = Polygon.union(tmpEnvelopes.map((e) => e.polygon));
		
		for(let i = 0; i < guides.length; i++){
			const segment = guides[i];
			if(segment.length() < this.buildingMinLength){
				guides.splice(i, 1);
				i--;
			}
		}

		const supports = [];
		for(let segment of guides){
			const totalLength = segment.length() + this.spacing; // on considère un espace au bout du segment car on considère qu'un batiment est sa longuer + l'espace.
			const buildingCount = Math.floor(
				totalLength / (this.buildingMinLength + this.spacing)
			);
			const buildingLength = totalLength / buildingCount - this.spacing;

			const direction = segment.directionVector();

			let q1 = segment.point1;
			let q2 = add(q1, scale(direction, buildingLength));
			supports.push(new Segment(q1, q2));

			for(let i = 2; i <= buildingCount; i++){
				q1 = add(q2, scale(direction, this.spacing));
				q2 = add(q1, scale(direction, buildingLength));
				supports.push(new Segment(q1, q2));
			}
		}

		const bases = []
		for(const segment of supports){
			bases.push(new Envelope(segment, this.buildingWidth, 1).polygon);
		}

		// suppressions des bases s'intersectant:
		const epsilon = 0.001;
		for(let i = 0; i < bases.length - 1; i++){
			for(let j = i + 1; j < bases.length; j++){
				if(
					bases[i].intersectsPolygon(bases[j])||
					bases[i].distanceToPolygon(bases[j]) < this.spacing - epsilon
				){
					bases.splice(j, 1);
					j--;
				}
			}
		}

		return bases.map((base) => new Building(base));
	}

	#getIntersections() {
		const subset = [];
		for(const point of this.graph.points){
			let degree = 0;
			for (const segment of this.graph.segments){
				if(segment.includes(point)){
					degree++;
				}
			}

			if(degree > 2){
				subset.push(point);
			}
		}
		return subset;
	}

	#updateLights(){
		const lights = this.markings.filter((m) => m instanceof Light);

		const controlCenters = [];
		for(const light of lights){
			const point = getNearestPoint(light.center, this.#getIntersections());
			let controlCenter = controlCenters.find((c) => c.equals(point));
			if(!controlCenter) {
				controlCenter = new Point(point.x, point.y);
				controlCenter.lights = [light];
				controlCenters.push(controlCenter);
			} else {
				controlCenter.lights.push(light);
			}
		}

		const greenDuration = 2;
		const yellowDuration = 1;

		for(const center of controlCenters){
			center.ticks = center.lights.length * (greenDuration +  yellowDuration);
		}

		const tick = Math.floor(this.frameCount / 60);

		for(const center of controlCenters){
			const centerTick = tick % center.ticks;
			const greenYellowIndex = Math.floor(centerTick / (greenDuration + yellowDuration));
			const greenYellowState = centerTick % (greenDuration + yellowDuration) < greenDuration ? "green" : "yellow";

			for(let i = 0; i < center.lights.length; i++){
				if(i == greenYellowIndex){
					center.lights[i].state = greenYellowState;
				} else {
					center.lights[i].state = "red";
				}
			}
		}
		this.frameCount++;
	}

	draw(ctx, viewPoint) {
		this.#updateLights();

		for (const envelope of this.envelopes){
			envelope.draw(ctx, {fill: "#BBB", stroke: "#BBB", lineWidth: 15});
		}
		for(const marking of this.markings){
			marking.draw(ctx);
		}
		for (const segment of this.graph.segments) {
			segment.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
		 }

		for(const segment of this.roadBoarders){
			segment.draw(ctx, {color: "white", width: "4"});
		}

		const items = [
			...this.buildings,
			...this.trees
		];

		items.sort((a, b) =>
			b.base.distanceToPoint(viewPoint) -
			a.base.distanceToPoint(viewPoint)
		)
		for(const item of items){
			item.draw(ctx, viewPoint);
		}
	}
}