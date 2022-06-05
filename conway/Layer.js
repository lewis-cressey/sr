export class Layer {
	constructor(colour, width, height) {
		this.colour = colour
		this.width = width
		this.height = height
		this.stride = width + 2
		this.numCells = (width + 2) * (height + 2)
		this.cells = new Array(this.numCells)
		this.cells.fill(0)
	}

	reset() {
		for (let i = 0; i < this.numCells; i += 1) {
			this.cells[i] = 0
		}
	}

	getIndex(x, y) {
		return (y + 1) * this.stride + (x + 1)
	}

	getCell(x, y) {
		const index = this.getIndex(x, y)
		return !!this.cells[index]
	}

	setCell(x, y, isSet) {
		const index = this.getIndex(x, y)
		this.cells[index] = isSet ? 1 : 0
	}

	copyRow(cells, di, si) {
		const count = this.width + 2
		for (let i = 0; i < count; i += 1) {
			cells[di++] = cells[si++]
		}
	}

	copyColumn(cells, di, si) {
		const stride = this.stride
		const count = this.height + 2
		for (let i = 0; i < count; i += 1) {
			cells[di] = cells[si]
			si += stride
			di += stride
		}
	}

	advance() {
		const oldCells = this.cells.slice()
		this.copyRow(oldCells, 0, this.height * this.stride)
		this.copyRow(oldCells, (this.height + 1) * this.stride, this.stride)
		this.copyColumn(oldCells, 0, this.width)
		this.copyColumn(oldCells, this.width + 1, 1)

		const stride = this.stride
		for (let y = 0; y < this.height; y += 1) {
			let si = (y + 1) * stride + 1
			for (let x = 0; x < this.width; x += 1) {
				let count = 0
				count += oldCells[si - stride - 1]
				count += oldCells[si - stride]
				count += oldCells[si - stride + 1]
				count += oldCells[si - 1]
				count += oldCells[si + 1]
				count += oldCells[si + stride - 1]
				count += oldCells[si + stride]
				count += oldCells[si + stride + 1]
				if (count == 3) {
					this.cells[si] = 1
				} else if (count != 2) {
					this.cells[si] = 0
				}
				si += 1
			}
		}
	}

	count() {
		let count = 0
		for (let cell of this.cells) {
			if (cell) count += 1
		}
		return count
	}

	merge(cells) {
		const bitmask = 1 << (this.colour - 1)
		let di = 0
		for (let y = 1; y <= this.height; y += 1) {
			let si = y * this.stride + 1
			for (let x = 1; x <= this.width; x += 1) {
				if (this.cells[si]) cells[di] |= bitmask
				si += 1
				di += 1
			}
		}
	}

	purge(cells) {
		const bitmask = 1 << (this.colour - 1)
		let si = 0
		for (let y = 1; y <= this.height; y += 1) {
			let di = y * this.stride + 1
			for (let x = 1; x <= this.width; x += 1) {
				const cell = cells[si]
				if (cell !== 0 && cell !== bitmask) this.cells[di] = 0
				si += 1
				di += 1
			}
		}
	}

	setMap(text) {
		let si = 0
		let digit = 0x100
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				if (digit >= 0x100) {
					const digitChar = text.charAt(si++)
					digit = 0x10 + "0123456789ABCDEF".indexOf(digitChar)
				}
				this.setCell(x, y, !!(digit & 8))
				digit <<= 1
			}
		}
	}

	getMap() {
		let text = ""
		let si = 0
		let digit = 1
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				const cell = this.getCell(x, y)
				digit = (digit << 1) + (cell ? 1: 0)
				if (digit >= 0x10) {
					text += "0123456789ABCDEF".charAt(digit - 0x10)
					digit = 1
				}
			}
		}
		return text
	}
}


