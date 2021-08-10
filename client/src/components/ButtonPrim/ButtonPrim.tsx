// Node imports
import React, { FunctionComponent } from "react";

// SCSS imports
import './ButtonPrim.scss';

interface ButtonPrimProperties {
    onClick: () => void,
    text: string,
}

const ButtonPrim: FunctionComponent<ButtonPrimProperties> = ({onClick, text} : ButtonPrimProperties) => {
    return (
        <button className={`button-primary`} onClick={onClick}>
            {text}
        </button>
    );
}

export default ButtonPrim;