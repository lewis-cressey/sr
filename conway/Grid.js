import { Layer } from "./Layer.js"

export class Grid {
	constructor(width, height) {
		this.width = width
		this.height = height
		this.numCells = width * height

		const blankCells = new Array(this.numCells)
		blankCells.fill(0)

		this.lastCells = blankCells.slice()
		this.nextCells = blankCells.slice()

		this.layers = []
		this.layers.push(new Layer(1, width, height))
		this.layers.push(new Layer(2, width, height))
	}

	reset() {
		for (let layer of this.layers) {
			layer.reset()
		}
		this.update()
	}

	getLayer(colour) {
		return this.layers[colour - 1]
	}

	getCell(x, y) {
		const index = y * this.width + x
		return this.nextCells[index]
	}

	setCell(x, y, colour) {
		for (let layer of this.layers) {
			layer.setCell(x, y, layer.colour === colour)
		}
		this.update()
	}

	advance() {
		for (let layer of this.layers) {
			layer.advance()
		}
		this.update()
	}

	update() {
		const cells = this.lastCells
		this.lastCells = this.nextCells
		this.nextCells = cells

		cells.fill(0)
		for (let layer of this.layers) {
			layer.merge(cells)
		}
		for (let layer of this.layers) {
			layer.purge(cells)
		}
	}

	blend(colour1, colour2, ratio) {
		let result = "#"
		for (let i = 2; i >= 0; i -= 1) {
			const component1 = (colour1 >> (i * 8)) & 255
			const component2 = (colour2 >> (i * 8)) & 255
			const component = Math.floor(component1 * ratio + component2 * (1.0 - ratio))
			if (component < 16) result += "0"
			result += component.toString(16)
		}
		return result
	}

	createBlendedPalette(palette, blendRatio) {
		const blendPalette = []

		for (let colour1 of palette) {
			for (let colour2 of palette) {
				const colour = this.blend(colour1, colour2, blendRatio)
				blendPalette.push(colour)
			}
		}

		return blendPalette
	}

	paint(context2D, cellSize, blendRatio) {
		const palette = [ 0x202020, 0x77ff20, 0xff7720, 0xffffff ]
		const paletteSize = palette.length
		const blendPalette = this.createBlendedPalette(palette, blendRatio)

		let si = 0
		for (let y = 0; y < this.height; y += 1) {
			const dy = y * cellSize
			for (let x = 0; x < this.width; x += 1) {
				const dx = x * cellSize
				const lastColour = this.lastCells[si]
				const nextColour = this.nextCells[si]
				context2D.fillStyle = blendPalette[nextColour * paletteSize + lastColour]
				context2D.fillRect(dx, dy, cellSize-1, cellSize-1)
				si += 1
			}
		}
	}

	setColourMap(colour, layerMaps) {
		for (let i = 0; i < layerMaps.length; i += 1) {
			this.layers[i].setMap(layerMaps[i])
		}
		this.update()
	}

	getColourMap(colour) {
		let layerMaps = []
		for (let layer of this.layers) {
			const map = layer.getMap()
			layerMaps.push(map)
		}
		return layerMaps
	}
}

