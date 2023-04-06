import { Dispatch, MutableRefObject, PointerEvent, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { ShelvesMarkersZoom } from './ShelvesMarkersZoom';
import { Coordinates, CornersSetters, CornersValues, EditingCorner, RGB, ShelveType, StateType } from '../models/types';
import { Shelve } from '../models/Shelve';
import { countSize, defaultCoordinates, generateColorPart } from '../helpers/common';
import { clearCanvas, containsCoordinates, drawShelve, drawShelves } from '../helpers/canvas';
import { ShelveEditPanel } from './ShelveEditPanel';
import styles from './ShelvesMarkers.module.css';

type ShelvesMarkersProps = {
    imageUrl: string,
    shelves: ShelveType[],
    onChange: (shelves: [number, number][]) => void
}

let editedShelve: Shelve | null = null;
let pointerPosition: Coordinates = defaultCoordinates;
let zoomPositionClass = styles.left;

export function ShelvesMarkers({ imageUrl, shelves, onChange }: ShelvesMarkersProps) {

    const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
    const [formattedShelves, setFormattedShelves] = useState(() => {
        return shelves.reduce((acc: Shelve[], shelve: ShelveType, index: number, shelves: ShelveType[]) => {
            const nextIndex = index + 1;
            const isNextIndexExists = nextIndex < shelves.length;
            const isEven = index % 2 != 0;

            if (isEven || !isNextIndexExists) {
                return acc;
            }

            const shelveBRC = shelves[index + 1];
            acc.push(new Shelve(
                { x: shelve[0], y: shelve[1] },
                { x: shelveBRC[0], y: shelveBRC[1] },
                [index, index + 1]
            ));

            return acc;
        }, []);
    });

    const [ctx, setCtx]: StateType<CanvasRenderingContext2D> = useState(null as any);

    const [currentShelveColor, setCurrentShelveColor]: StateType<RGB> = useState([generateColorPart(), generateColorPart(), generateColorPart()]);
    const [currentShelveTLC, setCurrentShelveTLC] = useState(defaultCoordinates);
    const [currentShelveTRC, setCurrentShelveTRC] = useState(defaultCoordinates);
    const [currentShelveBRC, setCurrentShelveBRC] = useState(defaultCoordinates);
    const [currentShelveBLC, setCurrentShelveBLC] = useState(defaultCoordinates);
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [canBeEdit, setCanBeEdit] = useState(false);

    const currentCorners: CornersValues = {
        [EditingCorner.TLC]: currentShelveTLC,
        [EditingCorner.TRC]: currentShelveTRC,
        [EditingCorner.BRC]: currentShelveBRC,
        [EditingCorner.BLC]: currentShelveBLC,
    };

    const currentCornersSetters: CornersSetters = {
        [EditingCorner.TLC]: setCurrentShelveTLC,
        [EditingCorner.TRC]: setCurrentShelveTRC,
        [EditingCorner.BRC]: setCurrentShelveBRC,
        [EditingCorner.BLC]: setCurrentShelveBLC,
    };

    const image = useMemo(() => new Image(), []);

    useOnInitEffect(shelves, formattedShelves, canvasRef, setCtx, image, imageUrl);
    useDrawNewShelveEffect(ctx, formattedShelves, image, currentCorners, currentShelveColor, isInEditMode);
    useZoomPositionUpdateEffect();

    function finishEditing(currentEditedShelve: Shelve) {
        currentEditedShelve.color = currentShelveColor;
        restoreEdited(currentEditedShelve, currentCorners, setFormattedShelves);
        currentEditedShelve.disableEditMode();
        setIsInEditMode(false);
        setCanBeEdit(false);
        resetCorners(currentCornersSetters);
    }

    function pointerDownHandler(event: PointerEvent<HTMLCanvasElement>): void {
        let rect = ctx.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        pointerPosition = { x, y };

        if (isInEditMode) {
            const cornerToUpdate = editedShelve?.findClickedEditPoint({ x, y });

            if (cornerToUpdate != null) {
                setCanBeEdit(true);
                return;
            }
        }

        editedShelve?.disableEditMode();

        const shelve = formattedShelves.find(shelve => containsCoordinates(ctx, shelve, { x, y }));

        if (shelve) {
            if (editedShelve && shelve != editedShelve) {
                finishEditing(editedShelve);
            }
            setCurrentShelveTLC(shelve.tlc);
            setCurrentShelveTRC(shelve.trc);
            setCurrentShelveBRC(shelve.brc);
            setCurrentShelveBLC(shelve.blc);
            shelve.findClickedEditPoint({ x, y });

            setFormattedShelves(prevState => {
                return prevState.filter(s => s != shelve);
            });
            setIsInEditMode(true);
            editedShelve = shelve;
            setCurrentShelveColor(shelve.color);

            return;
        }

        if (editedShelve) {
            finishEditing(editedShelve);
            editedShelve = null;
        }

        initNewShelve({ x, y }, currentCornersSetters, setCurrentShelveColor);
    }

    function pointerMoveHandler(event: PointerEvent<HTMLCanvasElement>): void {
        if (event.buttons > 0) {
            let rect = ctx.canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

            pointerPosition = { x, y };

            if (canBeEdit) {
                if (editedShelve?.cornerToUpdate === EditingCorner.TLC) {
                    setCurrentShelveTLC({ x, y });
                }

                if (editedShelve?.cornerToUpdate === EditingCorner.TRC) {
                    setCurrentShelveTRC({ x, y });
                }


                if (editedShelve?.cornerToUpdate === EditingCorner.BRC) {
                    setCurrentShelveBRC({ x, y });
                }


                if (editedShelve?.cornerToUpdate === EditingCorner.BLC) {
                    setCurrentShelveBLC({ x, y });
                }
                return;
            }

            handleCreateMode(event, ctx, currentShelveTLC, currentCornersSetters);
        }
    }

    function pointerUpHandler() {
        const hasWidth = currentShelveTLC.x != currentShelveBRC.x;
        const hasHeight = currentShelveTLC.y != currentShelveBRC.y;
        const exists = hasWidth && hasHeight;

        if (isInEditMode) {
            emitShelvesChange(editedShelve!.cornersIndexesInShelves, editedShelve!);
            return;
        }

        if (!exists) {
            return;
        }

        shelves.push([currentShelveTLC.x, currentShelveTLC.y]);
        shelves.push([currentShelveBRC.x, currentShelveBRC.y]);

        const newShelveIndexes: [number, number] = [shelves.length - 2, shelves.length - 1];
        const newShelve = new Shelve(currentShelveTLC, currentShelveBRC, newShelveIndexes, currentShelveColor);

        setFormattedShelves((prevState): Shelve[] => {
            return [...prevState, newShelve];
        });

        emitShelvesChange(newShelveIndexes, newShelve);

        setCurrentShelveTLC(defaultCoordinates);
        setCurrentShelveTRC(defaultCoordinates);
        setCurrentShelveBRC(defaultCoordinates);
        setCurrentShelveBLC(defaultCoordinates);
    }

    function removeSelectedShelve() {
        editedShelve!.disableEditMode();
        shelves.splice(editedShelve!.cornersIndexesInShelves[0], 2);
        setIsInEditMode(false);
        setCanBeEdit(false);
        resetCorners(currentCornersSetters);
        onChange(shelves);
    }

    function emitShelvesChange([tlcIndex, brcIndex]: ShelveType, { tlc, brc }: { tlc: Coordinates, brc: Coordinates }) {
        shelves[tlcIndex] = [tlc.x, tlc.y];
        shelves[brcIndex] = [brc.x, brc.y];

        onChange(shelves);
    }

    return (
        <div>
            <div className={`${styles.canvasContainer}`}>
                {isInEditMode ? (
                    <ShelveEditPanel
                        removeAction={removeSelectedShelve}
                        onColorChange={setCurrentShelveColor}
                        shapeColor={currentShelveColor}
                        className={styles.editPanel} />
                ) : ''
                }
                <canvas width="800"
                        height="600"
                        ref={canvasRef}
                        onPointerDown={pointerDownHandler}
                        onPointerMove={pointerMoveHandler}
                        onPointerUp={pointerUpHandler}
                />
                {canBeEdit ? (
                    <ShelvesMarkersZoom
                        zoomLevel={4}
                        source={canvasRef.current}
                        position={pointerPosition}
                        className={`${styles.editZoom} ${zoomPositionClass}`}
                    />
                ) : ''}
            </div>
        </div>
    );
}

function useOnInitEffect(
    shelves: ShelveType[],
    formattedShelves: Shelve[],
    canvasRef: MutableRefObject<HTMLCanvasElement | null>,
    setCtx: Dispatch<SetStateAction<CanvasRenderingContext2D>>,
    image: HTMLImageElement,
    imageUrl: string
) {
    useEffect(() => {
        if (shelves.length % 2 != 0) {
            shelves.pop();
        }

        let ctx = canvasRef.current!.getContext('2d')!;
        setCtx(ctx);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        image.onload = () => {
            clearCanvas(ctx, image);
            drawShelves(ctx, formattedShelves);
        };
        image.src = imageUrl;
    }, []);
}

function useDrawNewShelveEffect(
    ctx: CanvasRenderingContext2D | undefined,
    shelves: Shelve[],
    image: HTMLImageElement,
    currentCorners: CornersValues,
    currentColor: RGB,
    isInEditMode: Boolean
) {

    const tlc = currentCorners[EditingCorner.TLC];
    const trc = currentCorners[EditingCorner.TRC];
    const brc = currentCorners[EditingCorner.BRC];
    const blc = currentCorners[EditingCorner.BLC];

    useEffect(() => {
        if (!ctx) {
            return;
        }

        clearCanvas(ctx, image);
        drawShelves(ctx, shelves);
        drawShelve(ctx,
            { tlc, trc, brc, blc, color: currentColor, isInEditMode });

    }, [isInEditMode, shelves, currentColor, tlc, trc, brc, blc]);
}

function useZoomPositionUpdateEffect() {
    useEffect(() => {
        if (zoomPositionClass === styles.left && pointerPosition.x < 140 && pointerPosition.y < 140) {
            zoomPositionClass = styles.right;
        }

        if (zoomPositionClass === styles.right && pointerPosition.x > 640 && pointerPosition.y < 140) {
            zoomPositionClass = styles.left;
        }
    }, [pointerPosition]);
}

function handleCreateMode(
    event: PointerEvent<HTMLCanvasElement>,
    ctx: CanvasRenderingContext2D,
    currentTLR: Coordinates,
    currentCornersSetters: CornersSetters
) {
    let rect = ctx.canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    if (currentTLR.x === defaultCoordinates.x) {
        currentCornersSetters[EditingCorner.TLC]({ x, y });
        currentTLR = { x, y };
    }

    const brc = { x, y };
    const { width, height } = countSize(currentTLR, brc);

    currentCornersSetters[EditingCorner.BRC](brc);
    currentCornersSetters[EditingCorner.TRC]({ x: brc.x, y: brc.y - height });
    currentCornersSetters[EditingCorner.BLC]({ x: brc.x - width, y: brc.y });
}


function resetCorners(cornersSetters: CornersSetters) {
    cornersSetters[EditingCorner.TLC](defaultCoordinates);
    cornersSetters[EditingCorner.TRC](defaultCoordinates);
    cornersSetters[EditingCorner.BRC](defaultCoordinates);
    cornersSetters[EditingCorner.BLC](defaultCoordinates);
}

function initNewShelve({
                           x,
                           y
                       }: Coordinates, cornersSetters: CornersSetters, colorSetter: Dispatch<SetStateAction<RGB>>) {
    colorSetter([generateColorPart(), generateColorPart(), generateColorPart()]);

    cornersSetters[EditingCorner.TLC]({ x, y });
    cornersSetters[EditingCorner.TRC]({ x, y });
    cornersSetters[EditingCorner.BRC]({ x, y });
    cornersSetters[EditingCorner.BLC]({ x, y });
}

function restoreEdited(editedShelve: Shelve, cornersValues: CornersValues, shelvesSetter: Dispatch<SetStateAction<Shelve[]>>) {
    shelvesSetter(prevState => {
        editedShelve.updateCorners({
            tlc: cornersValues[EditingCorner.TLC],
            trc: cornersValues[EditingCorner.TRC],
            brc: cornersValues[EditingCorner.BRC],
            blc: cornersValues[EditingCorner.BLC],
        });
        return [...prevState, editedShelve];
    });
}



