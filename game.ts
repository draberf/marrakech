'use strict';


enum Direction {EAST, NORTH, WEST, SOUTH};
enum Color {NONE, RED, BLUE, YELLOW, ORANGE};

/** Represents an in-game Carpet object.
 * 
 * @param {number} x The x-coordinate of upper-left carpet tile
 * @param {number} y The y-coordinate of upper-right carpet tile
 * 
 * @param {boolean} isVertical Whether the carpet is placed horizontaly or vertically
 * 
 * @param {Color} color The color of the carpet
 */
class Carpet {

    x: number;
    y: number;
    isVertical: boolean = false;
    color: Color = Color.NONE;

    constructor(x: number, y: number, isVertical?: boolean, color?: Color) { }
};

/** Initializes a 2D grid with predefined values.
 * 
 * @param {number} width The width of the grid (column count)
 * @param {Number} height The height of the grid (row count)
 * @param {T} value Initial value in each cell
 *  
 * @returns {Array<Array<T>>} A 2D array filled with the initial value
 */
function createBoard2D<T>(width: number, height: number, value: T): Array<Array<T>> {
    return [...Array(height)].map(_=>Array(width).fill(value));
}

/** Checks if two carpets overlap at least partially.
 * 
 * @param {*} carpet1 
 * @param {*} carpet2 
 * @returns 
 */
function checkOverlap(carpet1: Carpet, carpet2: Carpet): boolean {

    // TODO: remake function
    
    return true;
}

/**
 * 
 */
class Player {

    deck: Array<Color>;
    dirhams: number;
    constructor (deck: Array<Color>, dirhams: number) { }

    getTopCarpet(): Color {
        return this.deck[0];
    }

    pay(amount: number): void {
        this.dirhams = Math.max(this.dirhams-amount, 0);
        // TODO: specify behavior on cash out
    }

    receive(amount: number): void {
        this.dirhams += amount;
    }
}

class Board {

    assam_x: number;
    assam_y: number;
    assam_dir: Direction;

    width: number;
    height: number;

    grid: Array<Array<Color>>;

    top_carpets: Array<Carpet>;

    primary_diagonal_loop: boolean;

    constructor () {
        this.assam_x = 3;
        this.assam_y = 3;
        this.assam_dir = 3; // south

        this.width = 7;
        this.height = 7;

        this.grid = createBoard2D(this.width, this.height, Color.NONE);

        this.top_carpets = [];

        // decide if loops exist around the primary
        // diagonal corners
        this.primary_diagonal_loop = true;
    }

    color(x: number, y: number): Color {
        return this.grid[y][x];
    }

    /** Transforms coordinates into a unique index.
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    index(x: number, y: number) {
        return y*this.width + x;
    }

    /** Checks if carpet would overlap with any top carpet.
     * 
     * @param {carpet} carpet 
     */
    overlapsTopCarpet(carpet: Carpet): boolean {
        for (let top_carpet of this.top_carpets) {
            if (carpet.x == top_carpet.x && 
                carpet.y == top_carpet.y &&
                carpet.isVertical == carpet.isVertical) {
                    return true
                }
        }
        return false;
    }
    
    placeCarpet(carpet: Carpet): void {

        // cover board
        let x = carpet.x;
        let y = carpet.y;
        this.grid[y][x] = carpet.color;
        if (carpet.isVertical) { y += 1; }
        else { x += 1; }
        this.grid[y][x] = carpet.color;

    
        // remove potential top carpets by filtering
        let temp_top_carpets: Array<Carpet> = [];
        for (let top_carpet of this.top_carpets) {
            if (!checkOverlap(carpet, top_carpet)) {
                temp_top_carpets.push(top_carpet);
            }
        }
        this.top_carpets = temp_top_carpets;


        // create new top carpet
        this.top_carpets.push(carpet);
    }

    getValidPositions() {
        let positions: Array<Carpet> = [];

        // horizontal variants
        let horiz = [
            new Carpet(this.assam_x-1, this.assam_y-1, false, Color.NONE),
            new Carpet(this.assam_x,   this.assam_y-1, false, Color.NONE),
            new Carpet(this.assam_x-2, this.assam_y,   false, Color.NONE),
            new Carpet(this.assam_x+1, this.assam_y,   false, Color.NONE),
            new Carpet(this.assam_x-1, this.assam_y+1, false, Color.NONE),
            new Carpet(this.assam_x,   this.assam_y+1, false, Color.NONE)
        ];

        let vert = [
            new Carpet(this.assam_x-1, this.assam_y-1, true, Color.NONE),
            new Carpet(this.assam_x-1, this.assam_y,   true, Color.NONE),
            new Carpet(this.assam_x,   this.assam_y-2, true, Color.NONE),
            new Carpet(this.assam_x,   this.assam_y+1, true, Color.NONE),
            new Carpet(this.assam_x+1, this.assam_y-1, true, Color.NONE),
            new Carpet(this.assam_x+1, this.assam_y,   true, Color.NONE),
        ]

        for (let carpet of [...horiz, ...vert]) {
            if (!this.isCarpetOutOfBounds(carpet) &&
                !this.overlapsTopCarpet(carpet)) {
                    positions.push(carpet);
                }
        }

        return positions;
    }

    isOutOfBounds(x: number, y: number): boolean {
        return (
            x < 0 || x > this.width ||
            y < 0 || y > this.height);
    }

    isAssamOutOfBounds(): boolean {
        return this.isOutOfBounds(this.assam_x, this.assam_y);
    }

    isCarpetOutOfBounds(carpet: Carpet): boolean {
        if (carpet.x < 0 || carpet.y < 0) { return true; }
        
        let max_x = carpet.x;
        let max_y = carpet.y;
    
        if (!carpet.isVertical) { max_x += 1; }
        else { max_y += 1; }
    
        if (max_x >= this.width || max_y >= this.height ) { return true; }
    
        return false;
    }

    turnAssam(right: boolean): void {
        this.assam_dir += (right ? -1 : 1);
        this.assam_dir %= 4;
    }

    moveAssamStep(checkOutOfBounds: boolean): void {
        // right
        if (this.assam_dir == 0) {
            this.assam_x += 1;
        }
        // up
        if (this.assam_dir == 1) {
            this.assam_y -= 1;
        }
        // left
        if (this.assam_dir == 2) {
            this.assam_x -= 1;
        }
        // down
        if (this.assam_dir == 3) {
            this.assam_y += 1;
        }

        if (!checkOutOfBounds) { return; }

        // check out of bounds
        if (this.isAssamOutOfBounds()) {
            
            // set turning direction
            let right = true;
            for (let boolean of [
                this.assam_x % 2 == 1,
                this.assam_y % 2 == 1,
                this.primary_diagonal_loop]) {
                    right = (boolean ? !right : right);
                }

            // loop Assam around
            do {
                this.turnAssam(right);
                this.moveAssamStep(false);
            } while (this.isAssamOutOfBounds());
            // add one more step (moving OOB isn't a step)
            this.moveAssamStep(false);
        }
    }

    moveAssam(steps: number): void {
        for (let i = 0; i < steps; i++) {
            this.moveAssamStep(true);
        }
    }

    findContiguousUnderAssam(): number {
        
        let color = this.color(this.assam_x, this.assam_y);
        if (color == Color.NONE) { return 0; }
        
        let queue: Array<[number,number]> = [[this.assam_x,this.assam_y]];
        let visited: Array<number> = [];

        while (queue.length > 0) {

            // using the assertion operator '!'
            // if the queue was empty, this branch wouldn't start
            let [x,y]: [number,number] = queue.pop()!;
            
            // check for failures
            if (this.isOutOfBounds(x,y))  { continue; }
            if (this.color(x,y) != color) { continue; }
            let index = this.index(x, y);
            if (visited.includes(index)) { continue; }            

            // extend visited
            visited.push(index);

            // update queue
            queue.push([x-1, y  ]);
            queue.push([x+1, y  ]);
            queue.push([x,   y-1]);
            queue.push([x,   y+1]);
        }

        return visited.length;
    }
    
}

class Game {

    players: Array<string>;
    playercount: number;

    board: Board;

    constructor (players: Array<string>) {
        
        this.playercount = players.length;

        this.board = new Board();
    }
}