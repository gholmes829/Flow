import React, { useState, useEffect } from "react";
import "../App.css";

const Column = (props) => {
    return (
        <>
        <div className="Column">
            {props.elements}
        </div>
        </>
    )
}

export default Column;