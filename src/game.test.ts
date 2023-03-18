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
