export class GameMode {
	constructor(name, description, init, check = null) {
		this.name = name
		this.description = description
		this.init = init
		this.check = check
		this.isComplete = false
	}

	markCompleted() {
		this.isComplete = true
		console.log("Completed")
	}

	setEnemy(game, map) {
		game.grid.getLayer(2).setMap(map)
		game.grid.update()
	}
}

const DEFAULT_MODE = new GameMode("Lonely life",
	`
		This mode allows you to experiment with a single life form.
		You can create living cells anywhere on the board.
	`,
	function(game) {
		const width = game.grid.width
		const height = game.grid.height
		game.addRegion(0, 0, width, height, 1)
	})

const BATTLE_MODE = new GameMode("Battle",
	`
		This mode splits the screen between two life forms who can battle each
		other.
		Battle occurs when two different colours fight for the same square,
		in which case that square will die on the next turn.
	`,
	function(game) {
		const width = game.grid.width / 2
		const height = game.grid.height
		game.addRegion(0, 0, width, height, 1)
		game.addRegion(width, 0, width, height, 2)
	})

const CHALLENGE1 = new GameMode("Challenge 1",
	`
		In this challenge, you must create a life form which can simply survive
		for at least 20 turns.
	`,
	function(game) {
		game.addRegion(15, 11, 2, 2, 1)
	},
	function(game) {
		return game.turn >= 20 && game.grid.getLayer(1).count() > 0
	})

const CHALLENGE2 = new GameMode("Challenge 2",
	`
		In this challenge, you must create a life form with exactly 6 cells.
	`,
	function(game) {
		game.addRegion(13, 12, 5, 1, 1)
	},
	function(game) {
		return game.turn >= 5 && game.grid.getLayer(1).count() === 6
	})

const CHALLENGE3 = new GameMode("Challenge 3",
	`
		In this challenge, you must destroy all the brown cells.
	`,
	function(game) {
		game.addRegion(12, 10, 3, 3, 1)
		this.setEnemy(game, "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000050000000200000000000000000")
	},
	function(game) {
		return game.grid.getLayer(2).count() === 0
	})

const CHALLENGE4 = new GameMode("Challenge 4",
	`
		In this challenge, you must create any life form which can grow to more
		than 50 cells.
	`,
	function(game) {
		game.addRegion(14, 10, 3, 3, 1)
	},
	function(game) {
		return game.grid.getLayer(1).count() > 50
	})

const CHALLENGE5 = new GameMode("Challenge 5",
	`
		In this challenge, you must create any life form which can grow to more
		than 100 cells.
	`,
	function(game) {
		game.addRegion(12, 8, 7, 7, 1)
	},
	function(game) {
		return game.grid.getLayer(1).count() > 100
	})

const CHALLENGE6 = new GameMode("Challenge 6",
	`
		In this challenge, you must destroy all the brown cells.
	`,
	function(game) {
		game.addRegion(1, 10, 4, 4, 1)
		this.setEnemy(game, "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018000000EC000000F800000070000000000000000000000000000000000000000000000000000000000000000000000000")
	},
	function(game) {
		return game.grid.getLayer(2).count() === 0
	})

const CHALLENGE7 = new GameMode("Challenge 7",
	`
		In this challenge, you must conquer the entire brown army.
	`,
	function(game) {
		game.addRegion(0, 0, 16, 24, 1)
		this.setEnemy(game, "000000000000000000000110000000C40000034C000000B0000001440000022400000128000000C800000484000007020000024C000001C8000000B8000000480000008000000100000000E800000100000000D0000000A80000008000000000")
	},
	function(game) {
		return game.grid.getLayer(2).count() === 0
	})

export const GAME_MODES = [
	DEFAULT_MODE,
	BATTLE_MODE,
	CHALLENGE1,
	CHALLENGE2,
	CHALLENGE3,
	CHALLENGE4,
	CHALLENGE5,
	CHALLENGE6,
	CHALLENGE7,
]

