import { Dispatch, SetStateAction } from 'react';

export enum EditingCorner {
    TLC = 'tlc',
    TRC = 'trc',
    BRC = 'brc',
    BLC = 'blc',
}

export type StateType<A> = [A, Dispatch<SetStateAction<A>>]

export type CornersValues = {
    [EditingCorner.TLC]: Coordinates,
    [EditingCorner.TRC]: Coordinates,
    [EditingCorner.BRC]: Coordinates,
    [EditingCorner.BLC]: Coordinates,
}

export type CornersSetters = {
    [EditingCorner.TLC]: Dispatch<SetStateAction<Coordinates>>,
    [EditingCorner.TRC]: Dispatch<SetStateAction<Coordinates>>,
    [EditingCorner.BRC]: Dispatch<SetStateAction<Coordinates>>,
    [EditingCorner.BLC]: Dispatch<SetStateAction<Coordinates>>
}

export type Coordinates = { x: number, y: number };

export type Size = { width: number, height: number };

export type ShelveType = [number, number];

export type RGB = [number, number, number];

