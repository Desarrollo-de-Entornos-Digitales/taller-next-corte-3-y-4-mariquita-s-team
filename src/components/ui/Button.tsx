import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

export default function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
    const baseClass =
        'w-full rounded-md py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';
    const variantClass =
        variant === 'primary'
            ? 'bg-green-700 text-white hover:bg-green-800'
            : 'border border-green-700 text-green-700 hover:bg-green-50';

    return <button type={type} className={`${baseClass} ${variantClass} ${className}`.trim()} {...props} />;
}
