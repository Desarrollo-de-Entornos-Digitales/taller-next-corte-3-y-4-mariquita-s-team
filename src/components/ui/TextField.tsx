import type { InputHTMLAttributes } from 'react';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    label: string;
    helperText?: string;
    errorText?: string;
    inputClassName?: string;
};

export default function TextField({ label, helperText, errorText, inputClassName = '', ...props }: TextFieldProps) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            <input
                className={`w-full rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-700 ${inputClassName}`.trim()}
                {...props}
            />
            {helperText && !errorText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
            {errorText && <p className="mt-1 text-xs text-rose-500">{errorText}</p>}
        </div>
    );
}
