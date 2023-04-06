import { RGB } from '../models/types';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';

type Props = {
    removeAction: () => void,
    onColorChange: Dispatch<SetStateAction<RGB>>,
    className: string,
    shapeColor: RGB
}

export function ShelveEditPanel({ removeAction, onColorChange, className, shapeColor = [0, 0, 0] }: Props) {

    const [color, setColor] = useState('#00000');

    useUpdateColor(shapeColor, setColor);

    function colorChanged(event: ChangeEvent<HTMLInputElement>) {
        const hexColor = event.target.value;
        const r = parseInt(hexColor.substring(1, 3), 16);
        const g = parseInt(hexColor.substring(3, 5), 16);
        const b = parseInt(hexColor.substring(5), 16);

        onColorChange([r, g, b]);
        setColor(hexColor);
    }

    return (
        <div className={className}>
            <button onClick={removeAction}>Remove</button>
            <input type="color" value={color} onChange={colorChanged} />
        </div>
    );
}

function useUpdateColor(shapeColor: RGB, colorSetter: Dispatch<SetStateAction<string>>) {
    useEffect(() => {
        let hexR = shapeColor[0].toString(16);
        hexR = hexR.length < 2 ? `0${hexR}` : hexR;

        let hexG = shapeColor[1].toString(16);
        hexG = hexG.length < 2 ? `0${hexG}` : hexG;

        let hexB = shapeColor[2].toString(16);
        hexB = hexB.length < 2 ? `0${hexB}` : hexB;

        colorSetter(`#${[hexR, hexG, hexB].join('')}`);
    }, [shapeColor]);
}