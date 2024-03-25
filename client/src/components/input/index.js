import React from "react"

const Input = ({
    lable = '',
    name = '',
    type = 'text',
    className = '',
    inputClassName = '',
    isRequired = true,
    placeholder = '',
    value = '',
    onChange = ()=>{}
})=>{
    return (
        <div className={`${className}`}>
            <label htmlFor={name} className='block mb-2 text-sm font-medium text-gary-900 dark:yexy-gray-300'>{lable}</label>
            <input type={type} id={name} className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gary-700 dark:border-gary-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-bule-500 ${inputClassName}`} placeholder={placeholder} required={isRequired} value={value} onChange={onChange}/>
        </div>
    )
}

export default Input 