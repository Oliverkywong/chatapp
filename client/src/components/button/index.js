import React from "react";

const Button = ({
    lable = 'Button',
    type = 'button',
    className = '',
    disable = false
})=> {
    return (
        <button type={type} className={`text-white bg-primary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-blue-300 text-sm font-medium rounded-lg w-full py-2.5 px-5 text-center sm:w-auto ${className}`} disabled={disable}>{lable}</button>
    )
}

export default Button