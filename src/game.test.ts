// CARPET tests

import {Color, Carpet, checkOverlap, Direction} from './game';

test('constructs carpet', () => {
    let carpet: Carpet = new Carpet(0,0);
    expect(carpet.color).toBe(Color.NONE);
    expect(carpet.isVertical).toBe(false);
})

test('constructs vertical carpet with color', () => {
    let carpet: Carpet = new Carpet(1,2,true,Color.RED);
    expect(carpet.x).toBe(1);
    expect(carpet.y).toBe(2);
    expect(carpet.isVertical).toBe(true);
    expect(carpet.color).toBe(Color.RED);
})

test('horizontal carpet second tile has good offset', () => {
    let carpet: Carpet = new Carpet(3,3,false);
    expect(carpet.getSecondTile()).toEqual({x: 4, y: 3});
})

test('vertical carpet second tile has good offset', () => {
    let carpet: Carpet = new Carpet(4,4,true);
    expect(carpet.getSecondTile()).toEqual({x: 4, y: 5});
})

test('carpets overlap or don\'t', () => {
    // create a list of carpets one way or another
    let carpets: Array<Carpet> = [];
    carpets.push(new Carpet(0,0,false));
    carpets.push(new Carpet(1,0,false));
    carpets.push(new Carpet(2,0,false));
    carpets.push(new Carpet(0,1,false));
    carpets.push(new Carpet(0,-1, false));

    carpets.push(new Carpet(0,0,true));
    carpets.push(new Carpet(0,1,true));
    carpets.push(new Carpet(0,2,true));
    carpets.push(new Carpet(1,0,true));
    carpets.push(new Carpet(-1,0,true));
    
    // create expected pairings
    let pairings: Array<Array<boolean>> = [
        // horizontal                 |      vertical
        [true,  false,  false,  false,  true,   false,  false,  true,   false],
        [       true,   false,  false,  false,  false,  false,  true,   false],
        [               false,  false,  false,  false,  false,  false,  false],
        [                       false,  true,   true,   false,  true,   false],
        [                               false,  false,  false,  false,  false],
        [                                       true,   false,  false,  false],
        [                                               true,   false,  false],
        [                                                       false,  false],
        [                                                               false]
    ]

    let carpet_count: number = carpets.length;
    if (pairings.length != carpet_count-1) {
        throw Error("Not one fewer expected pairings than carpets.");
    }
    // TODO: check for all pairings

    for (let i = 0; i < carpet_count; i++) {
        for (let ii = i+1; ii < carpet_count; ii++) {
            expect([i, ii, checkOverlap(carpets[i], carpets[ii])]).toEqual([i, ii, pairings[i][ii-i-1]]);
            expect([i, ii, checkOverlap(carpets[ii], carpets[i])]).toEqual([i, ii, pairings[i][ii-i-1]]);
        }
    }
})


// PLAYERS
import { Player } from './game';

test('constructs player', () => {
    let player: Player = new Player([Color.RED], 30);
    expect(player.deck).toContain(Color.RED);
    expect(player.dirhams).toBe(30);
})

test('player has top color', () => {
    let player: Player = new Player([Color.YELLOW], 30);
    expect(player.getTopCarpet()).toBe(Color.YELLOW);
})

test('player receives money', () => {
    let player: Player = new Player([], 30);
    player.receive(15);
    expect(player.dirhams).toBe(45);
})

test('player pays money', () => {
    let player: Player = new Player([], 30);
    player.pay(20);
    expect(player.dirhams).toBe(10);
})

test('player overpays', () => {
    let player: Player = new Player([], 30);
    player.pay(50);
    expect(player.dirhams).toBe(0);
})

// BOARD
import { Board } from './game';

test('board constructor', () => {
    let board = new Board();
    
    expect(board.assam_x).toBe(3);
    expect(board.assam_y).toBe(3);
    expect(board.assam_dir).toBe(Direction.SOUTH);

    expect(board.width).toBe(7);
    expect(board.height).toBe(7);

    expect(board.top_carpets).toHaveLength(0);
})


test('board indices', () => {
    let board = new Board();
    
    expect(board.index(0,0)).toBe(0);
    expect(board.index(1,0)).toBe(1);
    expect(board.index(0,1)).toBe(7);
    expect(board.index(6,6)).toBe(48);
})


test('board functions on empty', () => {
    let board = new Board();
    
    expect(board.color(0,0)).toBe(Color.NONE);
    expect(board.color(6,6)).toBe(Color.NONE);
    
    expect(board.direction(0,0)).toBe(Direction.NORTH);
})

test('simple assam movement', () => {
    let board = new Board();
    
    board.turnAssam(false);
    expect(board.assam_x).toBe(3);
    expect(board.assam_y).toBe(3);
    expect(board.assam_dir).toBe(Direction.EAST);
    
    board.turnAssam(true);
    board.turnAssam(true);
    expect(board.assam_dir).toBe(Direction.WEST);
    
    board.moveAssam(1);
    expect(board.assam_x).toBe(2);
    expect(board.assam_y).toBe(3);
})

test('assam turns around', () => {
    let board = new Board();
    board.turnAssam(false);
    board.turnAssam(false);
    
    board.moveAssam(4);
    expect(board.assam_x).toBe(4);
    expect(board.assam_y).toBe(1);
    expect(board.assam_dir).toBe(Direction.SOUTH);
    
    board.turnAssam(false);
    board.moveAssam(3);
    expect(board.assam_x).toBe(5);
    expect(board.assam_y).toBe(0);
    expect(board.assam_dir).toBe(Direction.WEST);

    board.moveAssam(6);
    expect(board.assam_x).toBe(0);
    expect(board.assam_y).toBe(1);
    expect(board.assam_dir).toBe(Direction.SOUTH);

    board.moveAssam(7);
    expect(board.assam_x).toBe(1);
    expect(board.assam_y).toBe(4);
    expect(board.assam_dir).toBe(Direction.NORTH);
})

test('assam turns around (inverse)', () => {
    let board = new Board();
    board.primary_diagonal_loop = false;

    board.moveAssam(5);
    expect(board.assam_x).toBe(4);
    expect(board.assam_y).toBe(4);
    expect(board.assam_dir).toBe(Direction.NORTH);

})

test('horizontal carpet placement', () => {
    let board = new Board();

    board.placeCarpet(new Carpet(1,1,false,Color.RED));

    expect(board.color(1,1)).toBe(Color.RED);
    expect(board.color(2,1)).toBe(Color.RED);

    expect(board.direction(1,1)).toBe(Direction.WEST);
    expect(board.direction(2,1)).toBe(Direction.EAST);

    expect(board.top_carpets.length).toBe(1);
})

test('vertical carpet placement', () => {
    let board = new Board();

    board.placeCarpet(new Carpet(5,4,true,Color.ORANGE));

    expect(board.color(5,4)).toBe(Color.ORANGE);
    expect(board.color(5,5)).toBe(Color.ORANGE);

    expect(board.direction(5,4)).toBe(Direction.NORTH);
    expect(board.direction(5,5)).toBe(Direction.SOUTH);

    expect(board.top_carpets.length).toBe(1);
})

// BOARD GAMEPLAY

function setUpBoard(): Board {
    let board = new Board();
    
    board.placeCarpet(new Carpet(1,1,false,Color.YELLOW));
    board.placeCarpet(new Carpet(3,0,true,Color.YELLOW));
    board.placeCarpet(new Carpet(4,1,false,Color.ORANGE));
    
    board.placeCarpet(new Carpet(1,2,false,Color.RED));
    board.placeCarpet(new Carpet(3,2,false,Color.ORANGE));
    board.placeCarpet(new Carpet(1,2,true,Color.ORANGE));
    board.placeCarpet(new Carpet(4,2,false,Color.BLUE));
    
    board.placeCarpet(new Carpet(2,3,true,Color.YELLOW));
    board.placeCarpet(new Carpet(3,3,true,Color.RED));
    board.placeCarpet(new Carpet(5,3,true,Color.BLUE));
    
    board.placeCarpet(new Carpet(1,4,true,Color.YELLOW));
    board.placeCarpet(new Carpet(3,4,false,Color.RED));
    board.placeCarpet(new Carpet(4,4,true,Color.RED));
    
    board.placeCarpet(new Carpet(4,5,false,Color.BLUE));

    return board;
}

test('check top carpets mid-game', () => {
    let board = setUpBoard();

    let expectedTopCarpets: Array<Carpet> = [
        new Carpet(1,1,false),
        new Carpet(1,2,true),
        new Carpet(1,4,true),
        new Carpet(2,3,true),
        new Carpet(3,0,true),
        new Carpet(4,1,false),
        new Carpet(4,2,false),
        new Carpet(4,5,false),
        new Carpet(5,3,true)
    ];

    let overlappedCarpets: Array<Carpet> = [
        new Carpet(1,2,false),
        new Carpet(3,2,false),
        new Carpet(3,3,true),
        new Carpet(3,4,false),
        new Carpet(4,4,true)
    ];

    for (let carpet of expectedTopCarpets) {
        expect(board.overlapsTopCarpet(carpet)).toBe(true);
    }

    for (let carpet of overlappedCarpets) {
        expect(board.overlapsTopCarpet(carpet)).toBe(false);
    }
})

test('find contiguous area', () => {
    let board = setUpBoard();

    function matchExpectedAreas(expected: Array<[number,number]>): void {
        expect(board.findContiguousUnderAssam().length).toBe(expected.length);
        for (let [x,y] of expected) {
            expect(board.findContiguousUnderAssam()).toContain(board.index(x,y));
        }
    }

    matchExpectedAreas([[3,3], [3,4], [4,4]])

    board.turnAssam(false);
    board.turnAssam(false);
    board.moveAssam(1);
    matchExpectedAreas([[3,2]]);

    board.turnAssam(true);
    board.moveAssam(2);
    matchExpectedAreas([[4,2], [5,2], [5,3], [5,4], [5,5], [4,5]]);
    
    board.moveAssam(1);
    matchExpectedAreas([]);

})

test('check for contiguous OOB', () => {
    let board = new Board();

    board.placeCarpet(new Carpet(3,3,false,Color.RED));
    board.placeCarpet(new Carpet(5,3,false,Color.RED));
    board.placeCarpet(new Carpet(3,3,true,Color.RED));
    board.placeCarpet(new Carpet(3,5,true,Color.RED));

    let contig = board.findContiguousUnderAssam();

    expect(contig.length).toBe(7);
})

function isFakeCarpetInArray(elem: [number,number,boolean], array: Array<Carpet>): boolean {
    let [x, y, orientation] = elem;
    for (let carpet of array) {
        if (carpet.x == x && carpet.y == y && carpet.isVertical == orientation) {
            return true;
        }
    }
    return false;
}

test('find basic positions', () => {
    let board = new Board();

    board.assam_x = 2;
    board.assam_y = 4;

    let positions: Array<Carpet> = board.getValidPositions();

    let horizontals: Array<[number, number]> = [
        [1,3],
        [2,3],
        [0,4],
        [3,4],
        [1,5],
        [2,5]
    ]

    let verticals: Array<[number, number]> = [
        [1,3],
        [1,4],
        [2,2],
        [2,5],
        [3,3],
        [3,4]
    ]

    expect(positions.length).toBe(horizontals.length+verticals.length);

    let assignments: Array<[Array<[number,number]>, boolean]>
        = [[horizontals, false], [verticals, true]]


    for (let [array, orientation] of assignments) {
        for (let [x,y] of array) {
            expect(isFakeCarpetInArray([x,y,orientation], positions)).toBe(true);
        }
    }
})

test('OOB placement upper-left', () => {
    let board = new Board();

    board.assam_x = 1;
    board.assam_y = 0;

    let positions: Array<Carpet> = board.getValidPositions();

    let horizontals: Array<[number, number]> = [
        [2,0],
        [0,1],
        [1,1]
    ]

    let verticals: Array<[number, number]> = [
        [0,0],
        [2,0],
        [1,1]
    ]

    expect(positions.length).toBe(horizontals.length+verticals.length);

    let assignments: Array<[Array<[number,number]>, boolean]>
    = [[horizontals, false], [verticals, true]]

    for (let [array, orientation] of assignments) {
        for (let [x,y] of array) {
            expect(isFakeCarpetInArray([x,y,orientation], positions)).toBe(true);
        }
    }

})

test('OOB placement lower right', () => {
    let board = new Board();

    board.assam_x = 6;
    board.assam_y = 5;

    let positions = board.getValidPositions();

    let horizontals: Array<[number, number]> = [
        [5,4],
        [4,5],
        [5,6]
    ];

    let verticals: Array<[number, number]> = [
        [6,3],
        [5,4],
        [5,5]
    ];

    expect(positions.length).toBe(horizontals.length+verticals.length);
  
    let assignments: Array<[Array<[number,number]>, boolean]>
    = [[horizontals, false], [verticals, true]]

    for (let [array, orientation] of assignments) {
        for (let [x,y] of array) {
            expect(isFakeCarpetInArray([x,y,orientation], positions)).toBe(true);
        }
    }
})

test('overlapping placement condition', () => {
    let board = setUpBoard();

    board.assam_x = 2;
    board.assam_y = 2;

    let positions = board.getValidPositions();

    expect(positions.length).toBe(9);

    expect(isFakeCarpetInArray([1,1,false],positions)).toBe(false);
    expect(isFakeCarpetInArray([1,2,true ],positions)).toBe(false);
    expect(isFakeCarpetInArray([2,3,true ],positions)).toBe(false);
})