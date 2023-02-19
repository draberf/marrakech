'use strict';

/** directions:
 *        N: 1
 *  W: 2        E: 0
 *        S: 3
*/

class Carpet {
    constructor(x, y, isVertical, color) {
        this.x = x;
        this.y = y;
        this.isVertical = isVertical;
        this.color = color;
    }
};

/** Initializes a 2D grid with predefined values.
 * 
 * @param {Number} width 
 * @param {Number} height 
 * @param {*} value 
 * @returns 
 */
function createBoard2D(width, height, value) {
    return [...Array(height)].map(_=>Array(width).fill(value));
}

/** Checks if two carpets overlap at least partially.
 * 
 * @param {*} carpet1 
 * @param {*} carpet2 
 * @returns 
 */
function checkOverlap(carpet1, carpet2) {

    // both horizontal
    if (!carpet1.isVertical && !carpet2.isVertical) {
        return (abs(carpet1.x - carpet2.x) <= 1);
    }

    // both vertical
    if (carpet1.isVertical && carpet2.isVertical) {
        return (abs(carpet1.y - carpet2.y) <= 1);
    }

    // horizontal, then vertical
    if (!carpet1.isVertical && carpet2.isVertical) {
        x_diff = carpet2.x - carpet1.x;
        if (x_diff < 0 || x_diff > 1) { return false; }
        y_diff = carpet2.y - carpet1.y;
        if (y_diff < 0 || y_diff > 1) { return false; }
        return true;
    }

    // vertical, then horizontal
    {
        x_diff = carpet2.x - carpet1.x;
        if (x_diff < -1 || x_diff > 0) { return false; }
        y_diff = carpet2.y - carpet2.y;
        if (y_diff < 0 || y_diff > 1)  { return false; }
        return true;
    }
}

class Player {
    constructor (deck) {
        this.deck = deck;
        this.dirhams = 30;
    }

    getTopCarpet() {
        return this.deck[0];
    }

    pay(amount) {
        this.dirhams = max(this.dirhams-amount, 0);
    }

    receive(amount) {
        this.dirhams += amount;
    }
}

class Board {

    constructor () {
        this.assam_x = 3;
        this.assam_y = 3;
        this.assam_dir = 3; // south

        this.width = 7;
        this.height = 7;

        this.board = createBoard2D(this.width,this.height,"empty");

        this.top_carpets = [];

        // decide if loops exist around the primary
        // diagonal corners
        this.primary_diagonal_loop = true;
    }

    color(x, y) {
        return this.board[y][x];
    }

    /** Transforms coordinates into a unique index.
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    index(x, y) {
        return y*this.width + x;
    }

    /** Checks if carpet would overlap with any top carpet.
     * 
     * @param {carpet} carpet 
     */
    overlapsTopCarpet(carpet) {
        for (let top_carpet of this.top_carpets) {
            if (carpet.x == top_carpet.x && 
                carpet.y == top_carpet.y &&
                carpet.isVertical == carpet.isVertical) {
                    return true
                }
        }
        return false;
    }
    
    placeCarpet(carpet) {

        // cover board
        let x = carpet.x;
        let y = carpet.y;
        this.board[y][x] = carpet.color;
        if (carpet.isVertical) { y += 1; }
        else { x += 1; }
        this.board[y][x] = carpet.color;

    
        // remove potential top carpets by filtering
        let temp_top_carpets = [];
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
        let positions = [];

        // horizontal variants
        let horiz = [
            Carpet(this.assam_x-1, this.assam_y-1, false),
            Carpet(this.assam_x,   this.assam_y-1, false),
            Carpet(this.assam_x-2, this.assam_y,   false),
            Carpet(this.assam_x+1, this.assam_y,   false),
            Carpet(this.assam_x-1, this.assam_y+1, false),
            Carpet(this.assam_x,   this.assam_y+1, false)
        ];

        let vert = [
            Carpet(this.assam_x-1, this.assam_y-1, true),
            Carpet(this.assam_x-1, this.assam_y,   true),
            Carpet(this.assam_x,   this.assam_y-2, true),
            Carpet(this.assam_x,   this.assam_y+1, true),
            Carpet(this.assam_x+1, this.assam_y-1, true),
            Carpet(this.assam_x+1, this.assam_y,   true),
        ]

        for (let carpet of [...horiz, ...vert]) {
            if (!isCarpetOutOfBounds(this.width,this.height,carpet) &&
                !this.overlapsTopCarpet(carpet)) {
                    positions.push(carpet);
                }
        }

        return positions;
    }

    isOutOfBounds(x, y) {
        return (
            x < 0 || x > this.width ||
            y < 0 || y > this.height);
    }

    isAssamOutOfBounds() {
        return this.isOutOfBounds(this.assam_x, this.assam_y);
    }

    isCarpetOutOfBounds(carpet) {
        if (carpet.x < 0 || carpet.y < 0) { return true; }
        
        let max_x = carpet.x;
        let max_y = carpet.y;
    
        if (!carpet.isVertical) { max_x += 1; }
        else { max_y += 1; }
    
        if (carpet.max_x >= this.width || carpet.max_y >= this.height ) { return true; }
    
        return false;
    }

    turnAssam(right) {
        this.assam_dir += (right ? -1 : 1);
        this.assam_dir %= 4;
    }

    moveAssamStep(checkOutOfBounds) {
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
            right = true;
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

    moveAssam(steps) {
        for (let i = 0; i < steps; i++) {
            this.moveAssamStep(true);
        }
    }

    findContiguousUnderAssam() {
        
        let color = this.color(this.assam_x, this.assam_y);
        if (color == "empty") { return 0; }
        
        let queue = [{x: this.assam_x, y: this.assam_y}];
        let visited = [];

        while (queue.length > 0) {

            [x, y] = queue.pop();
            
            // check for failures
            if (this.isOutOfBounds(x,y))  { continue; }
            if (this.color(x,y) != color) { continue; }
            index = this.index(x, y);
            if (visited.includes(index)) { continue; }            

            // extend visited
            visited.push(index);

            // update queue
            queue.push({x:x-1, y:y  });
            queue.push({x:x+1, y:y  });
            queue.push({x:x,   y:y-1});
            queue.push({x:x,   y:y+1});
        }

        return visited.length;
    }
    
}

class Game {

    constructor (players) {
        this.players = players;
        this.playercount = length(players);

        this.board = new Board();
    }
}