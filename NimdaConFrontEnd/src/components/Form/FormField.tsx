import React from 'react';

interface FormFieldProps {
    children: React.ReactNode;
    className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ children, className = '' }) => {
    return (
        <div 
        className = {`
            flex           /* display: flex */
            w-[400px]
            h-10   /* height: 40px (h-10 = 2.5rem = 40px) */ 
            py-2 px-4
            items-center
            gap-4
            flex-shrink-0
            rounded-lg
            border
            border-gray-200
            bg-white
            ${className}
        `}
        >
            {children}
        </div>
    );
};

export default FormField;
