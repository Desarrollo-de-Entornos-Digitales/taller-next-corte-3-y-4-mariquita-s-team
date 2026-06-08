type AlertBannerProps = {
    variant?: 'error' | 'success' | 'warning' | 'info';
    message: string;
};

const variantClasses: Record<NonNullable<AlertBannerProps['variant']>, string> = {
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    success: 'border-green-200 bg-green-50 text-green-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
};

export default function AlertBanner({ variant = 'info', message }: AlertBannerProps) {
    if (!message) {
        return null;
    }

    return (
        <div
            role="alert"
            className={`rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]}`}
            data-testid={`alert-${variant}`}
        >
            {message}
        </div>
    );
}
