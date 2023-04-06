import { Coordinates } from '../models/types';
import { Shelve } from '../models/Shelve';
import { EDIT_POINT_RADIUS } from './common';

export function clearCanvas(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
    ctx.scale(1, 1);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(image, 0, 0);
}

export function drawShelves(ctx: CanvasRenderingContext2D, shelves: Shelve[]) {
    shelves.forEach(shelve => drawShelve(ctx, shelve));
}

export function drawShelve(ctx: CanvasRenderingContext2D, { tlc, trc, brc, blc, color, isInEditMode }: any) {
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, .6)`;
    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, .35)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tlc.x, tlc.y);
    ctx.lineTo(trc.x, trc.y);
    ctx.lineTo(brc.x, brc.y);
    ctx.lineTo(blc.x, blc.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    if (isInEditMode) {
        ctx.setLineDash([0, 0]);
        drawEditPointer(ctx, tlc);
        drawEditPointer(ctx, trc);
        drawEditPointer(ctx, brc);
        drawEditPointer(ctx, blc);
    }
}

export function drawEditPointer(ctx: CanvasRenderingContext2D, corner: Coordinates) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(179,21,21, .5)';
    ctx.fillStyle = 'rgba(38,38,38, .5)';

    ctx.arc(corner.x, corner.y, EDIT_POINT_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

export function containsCoordinates(ctx: CanvasRenderingContext2D, shape: Shelve, clickPinter: Coordinates): Boolean {
    const path = new Path2D();
    path.moveTo(shape.tlc.x, shape.tlc.y);
    path.lineTo(shape.trc.x, shape.trc.y);
    path.lineTo(shape.brc.x, shape.brc.y);
    path.lineTo(shape.blc.x, shape.blc.y);
    path.closePath();

    return ctx.isPointInPath(path, clickPinter.x, clickPinter.y);
}