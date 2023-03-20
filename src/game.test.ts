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
