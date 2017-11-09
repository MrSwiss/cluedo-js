// Variables that must persist throught program

var canvas = undefined;
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 480;

const COLS = 20;
const ROWS = 20;
var board = new Array(COLS);
var gridGraphics = undefined;
const GRID_WIDTH = 480;
const GRID_HEIGHT = 480;

var characters = 1;
var hold = new Array(characters);
var rollValue = 6;
var currentCharacter = 0;

// Cell object
function Cell(i, j) {
    // Cell position
    this.i = i;
    this.j = j;
    // Pathfinding variables
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.n = [];
    // Not an obstacle be default
    this.obstacle = false;
    
    // Random obstacles for testing
    if (0.3 > random()) {
        this.obstacle = true;
    }
    
    if (this.i == 0 && this.j == 0) {
        this.obstacle = false;
    }
    
    this.hold = -1;
    
    this.show = function() {
        gridGraphics.fill(255);
        gridGraphics.stroke(0);
        if (this.obstacle == true) {
            gridGraphics.fill(0);
        }
        if (this.hold == -1) {
            gridGraphics.strokeWeight(0.5);
            gridGraphics.rect(this.i * (GRID_WIDTH / COLS), this.j * (GRID_HEIGHT / ROWS), (GRID_WIDTH / COLS) - 1, (GRID_HEIGHT / ROWS) - 1);
        } else {
            hold[this.hold].show();
        }
    }
    this.pathInit = function() {
        this.n = [];
        if (this.i < COLS - 1) {
            this.n.push(board[this.i + 1][j])
        }
        if (this.i > 0) {
            this.n.push(board[this.i - 1][j])
        }
        if (this.j < ROWS - 1) {
            this.n.push(board[this.i][j + 1])
        }
        if (this.j > 0) {
            this.n.push(board[this.i][j - 1])
        }
        this.f = 0;
        this.g = 0;
        this.h = 0;
    }
}

function Item(i, j) {
    this.i = i;
    this.j = j;
    
    this.show = function() {
        gridGraphics.fill(0, 255, 0);
        gridGraphics.stroke(0);
        gridGraphics.rect(this.i * (GRID_WIDTH / COLS), this.j * (GRID_HEIGHT / ROWS), (GRID_WIDTH / COLS) - 1, (GRID_HEIGHT / ROWS) - 1);
    }
}

function setup() {
    
    console.log("Starting client.js")
    
    // Init graphic canvas and buffers
    canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    gridGraphics = createGraphics(GRID_WIDTH, GRID_HEIGHT);
    
    // Making a 2D array
    for (var i = 0; i < COLS; i++) {
        board[i] = new Array(ROWS);
    }
    // Creating cell objects
    for (var i = 0; i < COLS; i++) {
        for (var j = 0; j < ROWS; j++) {
            board[i][j] = new Cell(i, j);
        }
    }
    
    hold[0] = new Item(0, 0);
    board[0][0].hold = 0;

    console.log("Setup complete")
}

function draw() {
    // Tell each cell to show itself
    for (var i = 0; i < COLS; i++) {
        for (var j = 0; j < ROWS; j++) {
            board[i][j].show();
        }
    }
    
    // Highlight where the player can go
    if (mouseX < 480 && mouseY < 480) {
        var x = Math.floor(mouseX / 480 * COLS);
        var y = Math.floor(mouseY / 480 * ROWS);
        if ( path(board[hold[currentCharacter].i][hold[currentCharacter].j] , board[x][y]) > rollValue && board[x][y].obstacle == false) {
            gridGraphics.fill(255, 0, 0, 72);
            gridGraphics.stroke(0);
            gridGraphics.rect(x * (GRID_WIDTH / COLS), y * (GRID_HEIGHT / ROWS), (GRID_WIDTH / COLS) - 1, (GRID_HEIGHT / ROWS) - 1);
        } 
        if ( path(board[hold[currentCharacter].i][hold[currentCharacter].j] , board[x][y]) <= rollValue && board[x][y].obstacle == false) {
            gridGraphics.fill(0, 255, 0, 72);
            gridGraphics.stroke(0);
            gridGraphics.rect(x * (GRID_WIDTH / COLS), y * (GRID_HEIGHT / ROWS), (GRID_WIDTH / COLS) - 1, (GRID_HEIGHT / ROWS) - 1);
        }
    }  
    
    image(gridGraphics, 0, 0);
    
}

function path(start, end) {
    // Initialise pathfinding variables
    for (var i = 0; i < COLS; i++) {
        for (var j = 0; j < ROWS; j++) {
            board[i][j].pathInit();
        }
    }
    var openSet = [];
    var closedSet = [];
    openSet.push(start);
    while (openSet.length > 0) {
        var lowestIndex = 0;
        for (var i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            }
        }
        var current = openSet[lowestIndex];
        if (openSet[lowestIndex] == end) {
            // console.log("Shortest path found from (" + start.i + ", " + start.j + ") to (" + end.i + ", " + end.j + "), length " + openSet[lowestIndex].f);
            return openSet[lowestIndex].f;
        }
        removeFromArray(openSet, current);
        closedSet.push(current);
        var neighbours = current.n;
        for (var i = 0; i < neighbours.length; i++) {
            var neighbour = neighbours[i];
            if (!closedSet.includes(neighbour) && !neighbour.obstacle) {
                var tentative_g = current.g + 1;
                if (openSet.includes(neighbour)) {
                    if (tentative_g < neighbour.g) {
                        neighbour.g = tentative_g;
                    }
                } else {
                    neighbour.g = tentative_g;
                    openSet.push(neighbour);
                }
                neighbour.h = heuristic(neighbour, end);
                neighbour.f = neighbour.g + neighbour.h;
            }
        }
    }
    // No solution
    // console.log("No path found.")
    return 100;
}

function removeFromArray (array, item) {
    // Go backwards through array, remove any items that are the same of the item passed
    for (var i = array.length - 1; i >= 0; i--) {
        if (array[i] == item) {
            array.splice(i, 1);
        }
    }
}

function heuristic (a, b) {
    // Manhattan heuristic
    return abs(a.i-b.i) + abs(a.j-a.j);
}

function mousePressed() {
    if (mouseX < 480 && mouseY < 480) {
        // Calculate the x-pos and y-pos of the mouse with respect to the grid
        var x = Math.floor(mouseX / 480 * COLS);
        var y = Math.floor(mouseY / 480 * ROWS);
        // If path short enough with respect to roll value and destination not an obstacle, move item
        if ( path(board[hold[currentCharacter].i][hold[currentCharacter].j] , board[x][y]) <= rollValue && board[x][y].obstacle == false) {
            moveItem(0, x, y);
        }
    }   
}

function moveItem(index, x, y) {
    // Empty the cell holding bay
    board[hold[index].i][hold[index].j].hold = -1;
    // Change the x-pos and y-pos of the item
    hold[index].i = x;
    hold[index].j = y;
    // Place the item in the new cell holding bay
    board[x][y].hold = index;
}