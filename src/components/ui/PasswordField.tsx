import type { InputHTMLAttributes } from 'react';
import { useState } from 'react';

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
    label: string;
    helperText?: string;
    inputClassName?: string;
};

export default function PasswordField({ label, helperText, inputClassName = '', ...props }: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full rounded-md border border-gray-300 px-4 py-2 pr-14 text-sm outline-none focus:border-green-700 ${inputClassName}`.trim()}
                    {...props}
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword((value) => !value)}
                >
                    {showPassword ? 'Hide' : 'Show'}
                </button>
            </div>
            {helperText && <p className="mt-1 text-xs text-rose-500">{helperText}</p>}
        </div>
    );
}