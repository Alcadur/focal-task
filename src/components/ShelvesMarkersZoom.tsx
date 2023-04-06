import { MutableRefObject, useEffect, useRef } from 'react';
import { Coordinates } from '../models/types';

type ShelvesMarkersZoomProps = {
    zoomLevel: number,
    source: HTMLCanvasElement | null,
    position: Coordinates,
    className?: string
    ref?: MutableRefObject<HTMLCanvasElement>
}

export function ShelvesMarkersZoom({ zoomLevel, source, position, className }: ShelvesMarkersZoomProps) {

    const zoomRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);

    useEffect(() => {
        if (!zoomRef.current || !source) {
            return;
        }

        const ctx = zoomRef.current.getContext('2d')!;

        const x = ((position.x * zoomLevel) - (ctx.canvas.width / 2));
        const y = ((position.y * zoomLevel) - (ctx.canvas.height / 2));
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.setTransform(1, 0, 0, 1, -x, -y);
        ctx.scale(zoomLevel, zoomLevel);
        ctx.drawImage(source, 0, 0);
    }, [position]);

    return (
        <canvas width="100"
                height="100"
                ref={zoomRef}
                className={className}
        />
    );
}