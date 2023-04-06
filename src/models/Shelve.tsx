import { Coordinates, EditingCorner, RGB } from './types';
import { defaultCoordinates, EDIT_POINT_RADIUS, generateColorPart } from '../helpers/common';

export interface ShelveInterface {
    tlc: Coordinates;
    trc: Coordinates;
    brc: Coordinates;
    blc: Coordinates;

    color: RGB,
}

export class Shelve implements ShelveInterface {
    private editingCorner: EditingCorner | null = null;

    cornersIndexesInShelves: [number, number] = [-1, -1];

    tlc: Coordinates = defaultCoordinates;
    trc: Coordinates = defaultCoordinates;
    brc: Coordinates = defaultCoordinates;
    blc: Coordinates = defaultCoordinates;

    color: RGB = [generateColorPart(), generateColorPart(), generateColorPart()];

    constructor(tlc: Coordinates, brc: Coordinates, indexes: [number, number], color?: RGB) {
        const { width, height } = this.countSize(tlc, brc);
        this.tlc = this.findRealTLC(tlc, brc);
        this.trc = { x: this.tlc.x + width, y: this.tlc.y };
        this.brc = { x: this.tlc.x + width, y: this.tlc.y + height };
        this.blc = { x: this.tlc.x, y: this.tlc.y + height };
        this.cornersIndexesInShelves = indexes;

        if (color) {
            this.color = color;
        }
    }

    get cornerToUpdate() {
        return this.editingCorner;
    }

    updateCorners({ tlc, trc, brc, blc }: { tlc: Coordinates, trc: Coordinates, brc: Coordinates, blc: Coordinates }) {
        this.tlc = tlc;
        this.trc = trc;
        this.brc = brc;
        this.blc = blc;
    }

    findClickedEditPoint(clickPosition: Coordinates): EditingCorner | undefined {
        const lengthFromTLC = this.countDistance(this.tlc, clickPosition);
        const lengthFromTRC = this.countDistance(this.trc, clickPosition);
        const lengthFromBRC = this.countDistance(this.brc, clickPosition);
        const lengthFromBLC = this.countDistance(this.blc, clickPosition);

        this.editingCorner = null;

        if (lengthFromTLC < EDIT_POINT_RADIUS) {
            this.editingCorner = EditingCorner.TLC;
            return this.editingCorner;
        }

        if (lengthFromTRC < EDIT_POINT_RADIUS) {
            this.editingCorner = EditingCorner.TRC;
            return this.editingCorner;
        }

        if (lengthFromBRC < EDIT_POINT_RADIUS) {
            this.editingCorner = EditingCorner.BRC;
            return this.editingCorner;
        }

        if (lengthFromBLC < EDIT_POINT_RADIUS) {
            this.editingCorner = EditingCorner.BLC;
            return this.editingCorner;
        }
    }

    disableEditMode() {
        this.editingCorner = null;
    }

    countDistance(start: Coordinates, end: Coordinates): number {
        return Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
    }

    private countSize(tlc: Coordinates, brc: Coordinates) {
        const width = Math.abs(brc.x - tlc.x);
        const height = Math.abs(brc.y - tlc.y);

        return { width, height };
    }

    private findRealTLC(tlc: Coordinates, brc: Coordinates): Coordinates {
        const { x: tlcX, y: tlcY } = tlc;
        const { x: brcX, y: brcY } = brc;
        const { width, height } = this.countSize(tlc, brc);

        // TLC -> BRC
        if (tlcX < brcX && tlcY < brcY) {
            return tlc;
        }

        // TRC -> BLC
        if (tlcX > brcX && tlcY < brcY) {
            return { x: tlcX - width, y: tlcY };
        }

        // BRC -> TLC
        if (tlcX > brcX && tlcY > brcY) {
            return brc;
        }

        // BLC -> TRC
        if (tlcX < brcX && tlcY > brcY) {
            return { x: tlcX, y: tlcY - height };
        }

        throw new Error('Congratulation you found new detention :)');
    }
}