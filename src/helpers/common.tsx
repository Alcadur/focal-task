import { Coordinates, Size } from '../models/types';

export const defaultCoordinates: Coordinates = { x: -1, y: -1 };

export const EDIT_POINT_RADIUS = 10;

export function generateColorPart(): number {
    return Math.floor(Math.random() * 256);
}

export function countSize(tlc: Coordinates, brc: Coordinates): Size {
    const width = brc.x - tlc.x;
    const height = brc.y - tlc.y;

    return { width, height };
}