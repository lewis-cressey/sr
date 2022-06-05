export class Region {
	constructor(x, y, width, height, colour) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.colour = colour
	}

	contains(x, y) {
		x -= this.x
		y -= this.y
		return x >= 0 && x < this.width && y >= 0 && y < this.height
	}

	paint(context2D, cellSize) {
		const x1 = this.x * cellSize
		const y1 = this.y * cellSize
		const width = this.width * cellSize
		const height = this.height * cellSize
		const x2 = x1 + width
		const y2 = y1 + height

		context2D.fillRect(x1-2, y1-2, width, 4)
		context2D.fillRect(x1-2, y1-2, 4, height)
		context2D.fillRect(x1-2, y2-2, width, 4)
		context2D.fillRect(x2-2, y1-2, 4, height + 4)
	}
}
