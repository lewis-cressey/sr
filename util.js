window.score = 0

function $(selector) {
	let found = document.querySelector(selector)
	if (!found) found = document.getElementById(selector)
	return found
}

function $eachFrame(f) {
	function f2() {
		f()
		window.requestAnimationFrame(f2)
	}
	f2()
}
