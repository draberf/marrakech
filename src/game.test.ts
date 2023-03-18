// CARPET tests

import {Color, Carpet, checkOverlap} from './game';

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

// 