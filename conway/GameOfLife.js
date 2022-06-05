import { Grid } from "./Grid.js"
import { Region } from "./Region.js"
import { GAME_MODES } from "./GameMode.js"

const HTML = `
	<style>
		:host {
			display: block;
			width: 660px;
			background: rgba(0, 0, 0, 0.5);
			padding: 5px;
			font-family: sans-serif;
		}
		canvas {
			display: block;
			margin: 0.5em auto;
//			border: 4px solid #6666ff;
		}
		fieldset {
			border: 0;
			padding: 0.5em 0;

			display: flex;
			flex-flow: row wrap;
			justify-content: center;
			align-content: center;
			align-items: center;
		}
		label {
			font-weight: bold;
			text-align: right;
			margin: 1em;
		}
		#game-area {
			position: relative;
		}
		#completion-message {
			pointer-events:none;

			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);

			display: flex;
			flex-flow: row wrap;
			justify-content: center;
			align-items: center;
			align-content: center;

			font-size: 24pt;
			font-weight: bold;
			font-family: cursive;
		}
		#status-bar {
			text-align: center;
		}
		#mode-description {
			padding: 1em 0;
		}
		.hidden {
			display: none !important;
		}
		.button-bar {
			text-align: center;
		}
		.counter {
			display: inline-block;
			text-align: right;
			min-width: 4em;
			font-weight: bold;
			font-family: monospace;
			font-size: 14pt;
			background: black;
			padding: 0.5em;
		}
	</style>
	<div id="game-area">
		<canvas id="game-canvas" width="640" height="480"></canvas>
		<div id="completion-message" class="hidden">Challenge completed!</div>
	</div>
	<div id="status-bar">
		Turn: <span id="turn-counter" class='counter'></span>
		Greens: <span id="layer1-counter" class='counter'></span>
		Browns: <span id="layer2-counter" class='counter'></span>
	</div>
	<div id="button-panel">
		<fieldset>
			<div class="button-bar">
				<button id="start-stop-button">Start</button>
				<button id="reset-button">Reset</button>
				<button id="save-button">Save</button>
				<button id="restore-button">Restore</button>
			</div>
		</fieldset>
		<fieldset>
			<div>
				<label for="mode-select">Mode:</label>
				<select id="mode-select"></select>
			</div>
			<div>
				<label for="speed-slider">Speed:</label>
				<input id="speed-slider" type="range" min="1" max="100">
			</div>
		</fieldset>
		<div id="mode-description"></div>
	</div>
`

export class GameOfLife extends HTMLElement {
	constructor() {
		super()

		this.dom = this.attachShadow({ mode: "open" })
		this.dom.innerHTML = HTML

		this.canvas = this.dom.getElementById("game-canvas")
		this.statusBar = this.dom.getElementById("status-bar")
		this.modeDescription = this.dom.getElementById("mode-description")
		this.completionMessage = this.dom.getElementById("completion-message")
		this.turnCounter = this.dom.getElementById("turn-counter")
		this.layer1Counter = this.dom.getElementById("layer1-counter")
		this.layer2Counter = this.dom.getElementById("layer2-counter")
		this.startStopButton = this.dom.getElementById("start-stop-button")
		this.resetButton = this.dom.getElementById("reset-button")
		this.speedSlider = this.dom.getElementById("speed-slider")
		this.modeSelect = this.dom.getElementById("mode-select")
		this.saveButton = this.dom.getElementById("save-button")
		this.restoreButton = this.dom.getElementById("restore-button")

		this.cellSize = 20
		this.grid = new Grid(32, 24)
		this.regions = []
		this.isRunning = false
		this.animationFrame = 0
		this.canvas.addEventListener("click", event => this.onClick(event))

		this.startStopButton.addEventListener("click", event => {
			this.turn = 0
			this.isRunning = !this.isRunning
			this.updateStatus()
		})

		this.resetButton.addEventListener("click", event => {
			this.isRunning = false
			this.setMode()
		})

		this.modeSelect.addEventListener("change", event => {
			this.setMode(event.target.selectedIndex)
		})

		this.saveButton.addEventListener("click", event => {
			const map = this.grid.getColourMap(1)
			const mapJson = JSON.stringify(map)
			localStorage.setItem(this.currentMode.name, mapJson)
			console.log(mapJson)
		})

		this.restoreButton.addEventListener("click", event => {
			const mapJson = localStorage.getItem(this.currentMode.name)
			console.log(mapJson)
			const map = JSON.parse(mapJson)
			if (map) this.grid.setColourMap(1, map)
			this.updateStatus()
		})

		for (let mode of GAME_MODES) {
			const optionNode = document.createElement("option")
			optionNode.textContent = mode.name
			this.modeSelect.append(optionNode)
		}

		this.setMode(0)

		window.setInterval(event => this.onFrame(), 20)
	}

	setMode(modeNumber = undefined) {
		this.turn = 0
		this.regions = []
		this.grid.reset()
		if (modeNumber !== undefined) this.currentMode = GAME_MODES[modeNumber]
		this.currentMode.init(this)
		this.modeDescription.innerHTML = this.currentMode.description
		this.updateStatus()
	}

	addRegion(x, y, width, height, colour) {
		let region = new Region(x, y, width, height, colour)
		this.regions.push(region)
	}

	getAnimationSpeed() {
		return this.speedSlider.value / 100
	}

	onClick(event) {
		const rect = event.target.getBoundingClientRect()
		let x = event.clientX - rect.left
		let y = event.clientY - rect.top
		const gridX = Math.floor(x / this.cellSize)
		const gridY = Math.floor(y / this.cellSize)
		const oldCell = this.grid.getCell(gridX, gridY)

		if (oldCell !== 0) {
			this.grid.setCell(gridX, gridY, 0)
		} else {
			for (let region of this.regions) {
				if (region.contains(gridX, gridY)) {
					this.grid.setCell(gridX, gridY, region.colour)
				}
			}
		}

		this.isRunning = false
		this.updateStatus()
	}

	updateStatus() {
		this.turnCounter.textContent = this.turn
		this.layer1Counter.textContent = this.grid.getLayer(1).count()
		this.layer2Counter.textContent = this.grid.getLayer(2).count()
		this.startStopButton.textContent = this.isRunning ? "Stop" : "Start"
		this.completionMessage.className = this.currentMode.isComplete ? "" : "hidden"
	}

	onFrame() {
		const context2D = this.canvas.getContext("2d")
		context2D.fillStyle = "black"
		context2D.fillRect(0, 0, this.canvas.width, this.canvas.height)

		const animationSpeed = this.getAnimationSpeed()
		this.grid.paint(context2D, this.cellSize, this.animationFrame)

		context2D.fillStyle = "#800000"
		for (let region of this.regions) {
			region.paint(context2D, this.cellSize)
		}

		const animationFrame = this.animationFrame + animationSpeed
		this.animationFrame = Math.min(animationFrame, 1)

		if (this.animationFrame >= 1 && this.isRunning) {
			this.turn += 1
			this.grid.advance()
			this.animationFrame = 0
			this.updateStatus()
		}

		if (this.currentMode.check && this.currentMode.check(this)) {
			this.currentMode.markCompleted()
			this.isRunning = false
			this.updateStatus()
		}
	}
}

customElements.define('game-of-life', GameOfLife)
