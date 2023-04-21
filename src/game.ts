export enum Direction {EAST, NORTH, WEST, SOUTH};
export enum Color {NONE, RED, BLUE, YELLOW, ORANGE};
export enum Action {TURN, ROLL, PLACE};

/** Represents an in-game Carpet object.
 * 
 * @param {number} x The x-coordinate of upper-left carpet tile
 * @param {number} y The y-coordinate of upper-right carpet tile
 * 
 * @param {boolean} isVertical Whether the carpet is placed horizontaly or vertically
 * 
 * @param {Color} color The color of the carpet
 */
export class Carpet {

    x: number;
    y: number;
    isVertical: boolean = false;
    color: Color = Color.NONE;

    constructor(x: number, y: number, isVertical?: boolean, color?: Color) {
        this.x = x;
        this.y = y;

        if (isVertical !== undefined) { this.isVertical = isVertical; }
        if (color !== undefined) { this.color = color; }
    }

    /** 
     * 
     * @returns The coordinates of the carpet's second tile
     */
    getSecondTile(): {x: number, y: number} {
        if (!this.isVertical) {
            return {x: this.x+1, y: this.y};
        } else {
            return {x: this.x, y: this.y+1};
        }
    }
};

/** Initializes a 2D grid with predefined values.
 * 
 * @param {number} width The width of the grid (column count)
 * @param {number} height The height of the grid (row count)
 * @param {T} value Initial value in each cell
 *  
 * @returns {Array<Array<T>>} A 2D array filled with the initial value
 */
function createBoard2D<T>(width: number, height: number, value: T): Array<Array<T>> {
    return [...Array(height)].map(_=>Array(width).fill(value));
}

/** Checks if two carpets overlap at least partially.
 * 
 * @param {Carpet} carpet1 
 * @param {Carpet} carpet2 
 * 
 * @returns {boolean} Whether the carpets overlap.
 */
export function checkOverlap(carpet1: Carpet, carpet2: Carpet): boolean {

    // definite miss:
    if (Math.abs(carpet1.x - carpet2.x) > 1) { return false; }
    if (Math.abs(carpet1.y - carpet2.y) > 1) { return false; }

    // both origins overlap
    if (carpet1.x === carpet2.x && carpet1.y === carpet2.y) {
        return true;
    }

    // other options
    const carpet1_aux: {x: number, y: number} = carpet1.getSecondTile();
    
    if (carpet1_aux.x === carpet2.x && carpet1_aux.y === carpet2.y) {
        return true;
    }

    const carpet2_aux: {x: number, y: number} = carpet2.getSecondTile();

    if (carpet1.x === carpet2_aux.x && carpet1.y === carpet2_aux.y) {
        return true;
    }
    if (carpet1_aux.x === carpet2_aux.x && carpet1_aux.y === carpet2_aux.y) {
        return true;
    }
    
    return false;
}

/** Represents a player entity in the game state.
 * 
 * 
 * 
 */
export class Player {

    deck: Array<Color>;
    dirhams: number;
    constructor (deck: Array<Color>, dirhams: number) {
        this.deck = deck;
        this.dirhams = dirhams;
    }

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

/** Represents the board in a game state.
 * 
 */
export class Board {

    assam_x: number;
    assam_y: number;
    assam_dir: Direction;

    width: number;
    height: number;

    grid: Array<Array<Color>>;
    dir_grid: Array<Array<Direction>>;

    top_carpets: Array<Carpet>;

    primary_diagonal_loop: boolean;

    constructor () {
        this.assam_x = 3;
        this.assam_y = 3;
        this.assam_dir = Direction.SOUTH; // south

        this.width = 7;
        this.height = 7;

        this.grid = createBoard2D(this.width, this.height, Color.NONE);
        this.dir_grid = createBoard2D(this.width, this.height, Direction.NORTH);

        this.top_carpets = [];

        // decide if loops exist around the primary
        // diagonal corners
        this.primary_diagonal_loop = true;
    }

    setValues(board: Board) {
        this.assam_x = board.assam_x;
        this.assam_y = board.assam_y;
        this.assam_dir = board.assam_dir;
        this.width = board.width;
        this.height = board.height;
        this.grid = board.grid;
        this.dir_grid = board.dir_grid;
        this.top_carpets = board.top_carpets;
        this.primary_diagonal_loop = board.primary_diagonal_loop;
    }


    /** Returns the color at a given board tile
     * 
     * @param x The x-coordinate of the tile
     * @param y The y-coordinate of the tile
     * 
     * @returns The tile color
     */
    color(x: number, y: number): Color {
        return this.grid[y][x];
    }

    /** Returns the direction of carpet tile at a given board tile
     * 
     * @param x The x-coordinate of the tile
     * @param y The y-coordinate of the tile
     * 
     * @returns The tile direction
     */
    direction(x: number, y: number): Direction {
        return this.dir_grid[y][x];
    }

    /** Transforms coordinates into a unique index.
     * 
     * @param x The x-coordinate of the tile
     * @param y The y-coordinate of the tile
     * 
     * @returns The tile index
     */
    index(x: number, y: number): number {
        return y*this.width + x;
    }

    /** Checks if carpet would overlap with any top carpet.
     * 
     * @param carpet The inspected carpet
     * 
     * @returns Whether the carpet overlaps with any of the board-tracked
     * 'top carpets'
     */
    overlapsTopCarpet(carpet: Carpet): boolean {
        for (let top_carpet of this.top_carpets) {
            if (carpet.x === top_carpet.x && 
                carpet.y === top_carpet.y &&
                carpet.isVertical === top_carpet.isVertical) {
                    return true
                }
        }
        return false;
    }
    
    /** Places the carpet on the board, updating all relevant parameters.
     * 
     * @param carpet The carpet to be placed
     */
    placeCarpet(carpet: Carpet): void {

        // cover board
        const x = carpet.x;
        const y = carpet.y;
        this.grid[y][x] = carpet.color;

        if (carpet.isVertical) {
            this.grid[y+1][x] = carpet.color;
            
            this.dir_grid[y][x] = Direction.NORTH;
            this.dir_grid[y+1][x] = Direction.SOUTH;
        }
        else {
            this.grid[y][x+1] = carpet.color;

            this.dir_grid[y][x] = Direction.WEST;
            this.dir_grid[y][x+1] = Direction.EAST;
        }

    
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

    /** Creates a list of potential carpet positions around Assam.
     * 
     * @returns List of valid positions as Carpets (x,y) 
     */
    getValidPositions(): Array<Carpet> {
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

        // vertical variants
        let vert = [
            new Carpet(this.assam_x-1, this.assam_y-1, true, Color.NONE),
            new Carpet(this.assam_x-1, this.assam_y,   true, Color.NONE),
            new Carpet(this.assam_x,   this.assam_y-2, true, Color.NONE),
            new Carpet(this.assam_x,   this.assam_y+1, true, Color.NONE),
            new Carpet(this.assam_x+1, this.assam_y-1, true, Color.NONE),
            new Carpet(this.assam_x+1, this.assam_y,   true, Color.NONE),
        ]

        // remove OOB carpets and those that overlap 1:1
        for (let carpet of [...horiz, ...vert]) {
            if (!this.isCarpetOutOfBounds(carpet) &&
                !this.overlapsTopCarpet(carpet)) {
                    positions.push(carpet);
                }
        }

        return positions;
    }

    /** Checks if a coordinate is out of bounds
     * 
     * @param x The x-coordinate of tile
     * @param y The y-coordinate of tile
     * 
     * @returns True the tile is out of board bounds
     */
    isOutOfBounds(x: number, y: number): boolean {
        return (
            x < 0 || x >= this.width ||
            y < 0 || y >= this.height);
    }

    /** Checks if Assam has stepped out of bounds
     * 
     * @returns True if Assam is out of board bounds
     */
    isAssamOutOfBounds(): boolean {
        return this.isOutOfBounds(this.assam_x, this.assam_y);
    }

    /** Checks if a carpet position is out of bounds
     * 
     * @param carpet The inspected carpet
     * 
     * @returns True if the carpet would be placed out of bounds
     */
    isCarpetOutOfBounds(carpet: Carpet): boolean {
        if (carpet.x < 0 || carpet.y < 0) { return true; }
        
        let max_x = carpet.x;
        let max_y = carpet.y;
    
        if (!carpet.isVertical) { max_x += 1; }
        else { max_y += 1; }
    
        if (max_x >= this.width || max_y >= this.height ) { return true; }
    
        return false;
    }

    /** Turns Assam ninety degrees.
     * 
     * @param right If Assam should turn right (turns left if false)
     */
    turnAssam(right: boolean): void {
        this.assam_dir += (right ? -1 : 1) + 4;
        this.assam_dir %= 4;
    }

    /** Moves Assam one step in his direction.
     * 
     * @param checkOutOfBounds If the step should worry about OOB movement
     */
    moveAssamStep(checkOutOfBounds: boolean): void {
        // right
        if (this.assam_dir === Direction.EAST) {
            this.assam_x += 1;
        }
        // up
        if (this.assam_dir === Direction.NORTH) {
            this.assam_y -= 1;
        }
        // left
        if (this.assam_dir === Direction.WEST) {
            this.assam_x -= 1;
        }
        // down
        if (this.assam_dir === Direction.SOUTH) {
            this.assam_y += 1;
        }

        if (!checkOutOfBounds) { return; }

        // check out of bounds
        if (this.isAssamOutOfBounds()) {
            
            // set turning direction
            let right: boolean;
            if (this.assam_x < 0 || this.assam_x >= this.width) {
                right = true;
            } else {
                right = false;
            }
            for (let boolean of [
                this.assam_x % 2 !== 0,
                this.assam_y % 2 !== 0,
                this.primary_diagonal_loop]) {
                    right = (boolean ? !right : right);
                }

            // loop Assam around
            do {
                this.turnAssam(right);
                this.moveAssamStep(false);
            } while (this.isAssamOutOfBounds());
            // add one more step (moving OOB isn't a step)
            // this.moveAssamStep(false);
            // this line was removed as the extra movement is unintuitive
        }
    }

    /** Moves Assam a number of steps in his direction.
     * 
     * @param steps The number of steps to move by
     */
    moveAssam(steps: number): void {
        for (let i = 0; i < steps; i++) {
            this.moveAssamStep(true);
        }
    }

    /** Returns the total contiguous area under Assam.
     * 
     * @returns The total number of contiguous tiles
     */
    findContiguousUnderAssam(): Array<Number> {
        
        const color = this.color(this.assam_x, this.assam_y);
        if (color === Color.NONE) { return []; }
        
        let queue: Array<[number,number]> = [[this.assam_x,this.assam_y]];
        let visited: Array<number> = [];

        while (queue.length > 0) {

            // using the assertion operator '!'
            // if the queue was empty, this branch wouldn't start
            const [x,y]: [number,number] = queue.pop()!;
            
            // check for failures
            if (this.isOutOfBounds(x,y))  { continue; }
            if (this.color(x,y) !== color) { continue; }
            const index = this.index(x, y);
            if (visited.includes(index)) { continue; }            

            // extend visited
            visited.push(index);

            // update queue
            queue.push([x-1, y  ]);
            queue.push([x+1, y  ]);
            queue.push([x,   y-1]);
            queue.push([x,   y+1]);
        }

        return visited;
    }
    
}

export class Game {

    players: Array<Player>;
    playercount: number;

    board: Board;

    turn: number;

    next_player: number;
    next_action: Action;

    last_rolled: number = -1;

    constructor (players: Array<Player>) {

        this.players = players;

        if (players.length < 2) {
            throw Error("Not enough players to start the game.");
        }

        if (players.length > 4) {
            throw Error("Too many players to start the game.");
        }

        this.next_player = 0;
        this.next_action = Action.TURN;
        
        this.playercount = players.length;

        this.board = new Board();
        this.turn = 0;

        // TODO: Add association between player and color
        // TODO: Add players as Player objects
    }
}