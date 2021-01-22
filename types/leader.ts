export default class Leader {
	name?: string;
	place?: number;
	points?: number;

	constructor(name: string, place: number, points: number) {
		this.name = name;
		this.place = place;
		this.points = points;
	}
}
