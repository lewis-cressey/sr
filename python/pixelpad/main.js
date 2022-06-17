window.ace.config.set("basePath", "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.13/")

const runButton = document.getElementById("run-button")
const stderr = document.getElementById("stderr")
const editor = window.ace.edit("editor")
const popupLayer = document.getElementById("popup-layer")
const screenCanvas = document.getElementById("screen")

/****************************************************************************
 ** Keyboard wrapper class.                                                **
 ****************************************************************************/

class Keyboard {
	constructor(canvas) {
		this.keys = new Map()
		
		canvas.addEventListener("keydown", event => {
			this.keys.set(event.code, true)
			console.log("Pressed key: " + event.code)
			event.preventDefault()
		})
		
		canvas.addEventListener("keyup", event => {
			this.keys.set(event.code, false)
			event.preventDefault()
		})
		
		canvas.addEventListener("blur", event => {
			this.keys.clear()
			event.preventDefault()
		})
	}
	
	test_key(code) {
		return !!this.keys.get(code)
	}
}

const keyboard = new Keyboard(screenCanvas)

/****************************************************************************
 ** Screen wrapper class.                                                  **
 ****************************************************************************/

class Screen {
	constructor(canvas, pixelSize) {
		this.canvas = canvas
		this.context = canvas.getContext("2d")
		this.pixelSize = pixelSize
		this.width = Math.floor(canvas.width / pixelSize)
		this.height = Math.floor(canvas.height / pixelSize)
		this.pixels = new Array(this.width * this.height)
		this.pixels.fill("#000000")
		this.currentColour = "#ffffff"
		setInterval(() => this.update(), 40)
	}
	
	clear() {
		this.pixels.fill("#000000")
	}
	
	set_colour(colour) {
		this.currentColour = colour
	}
	
	peek(x, y) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			const index = y * this.width + x
			return this.pixels[index]
		}
		return ""
	}
	
	plot(x, y) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			const index = y * this.width + x
			this.pixels[index] = this.currentColour
		}
	}
	
	update() {
		let si = 0
		for (let y = 0; y < this.height; y += 1) {
			const dy = (this.height - y - 1) * this.pixelSize
			for (let x = 0; x < this.width; x += 1) {
				const dx = x * this.pixelSize
				this.context.fillStyle = this.pixels[si++]
				this.context.fillRect(dx, dy, this.pixelSize, this.pixelSize)
			}
		}
	}
}

const screen = new Screen(screenCanvas, 10)

/****************************************************************************
 ** Screen refresh.                                                        **
 ****************************************************************************/

let frameHandler = null

function showError(text) {
	const popupLayer = document.getElementById("popup-layer")
	const stderr = document.getElementById("stderr")
	stderr.textContent = text
	popupLayer.classList.remove("hidden")
	frameHandler = null
	return null
}
	
setInterval(event => {
	if (frameHandler) {
		try {
			frameHandler()
		} catch (e) {
			showError(e.toString())
		}
	}
}, 20)

/****************************************************************************
 ** Configure page elements.                                               **
 ****************************************************************************/

const initPage = function() {
	const code = localStorage.getItem("code") 

	editor.setOptions({
		"mode": 'ace/mode/python',
	});

	if (code) {
		editor.session.setValue(code)
	}
	
	popupLayer.addEventListener("click", function() {
		popupLayer.classList.add("hidden")
	})
}

/****************************************************************************
 ** Python environment                                                     **
 ****************************************************************************/

const hostpageModule = {
	show_error: showError
}

const builtins = {
	test_key(code) {
		return keyboard.test_key(code)
	},
	
	clear: function() {
		screen.clear()
	},
	
	set_colour: function(red, green, blue) {
		if (Number.isInteger(red) && Number.isInteger(green) && Number.isInteger(blue)) {
			red = "00" + red.toString(16)
			green = "00" + green.toString(16)
			blue = "00" + blue.toString(16)
			red = red.slice(red.length - 2)
			green = green.slice(green.length - 2)
			blue = blue.slice(blue.length - 2)
			screen.set_colour(`#${red}${green}${blue}`)
		} else {
			showError(`(${red}, ${green}, ${blue}) is not a valid RGB colour!`)
		}
	},
	
	plot: function(x, y) {
		if (Number.isInteger(x) && Number.isInteger(y)) {
			screen.plot(x, y)
		} else {
			showError(`(${x}, ${y}) are not valid coordinates!`)
		}
		return null
	}
}

/****************************************************************************
 ** Set up Pyodide.                                                        **
 ****************************************************************************/

const initPython = async function() {
	const pyodide = await loadPyodide();
	for (let key of Object.keys(builtins)) {
		pyodide.globals.set(key, builtins[key])
	}
	pyodide.registerJsModule("hostpage", hostpageModule)

	runButton.addEventListener("click", async function() {
		const code = editor.getValue()
		localStorage.setItem("code", code)
		
		pyodide.runPython(`
			import pyodide
			import hostpage
			
			def each_frame():
				pass

			def run_program(code, namespace):
				clear()
				try:
					pyodide.eval_code(code, namespace)
				except Exception as e:
					hostpage.show_error(str(e))
				return None
		`)
		
		screenCanvas.focus()
		pyodide.globals.get("run_program")(code, pyodide.globals)
		frameHandler = pyodide.globals.get("each_frame")
	})
}

/****************************************************************************
 ** Call init stages.                                                      **
 ****************************************************************************/

initPage()
initPython()
