type SelectableChipProps = {
    label: string;
    selected?: boolean;
    onClick: () => void;
};

export default function SelectableChip({ label, selected = false, onClick }: SelectableChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full rounded-lg border px-4 py-2 text-left text-sm font-medium transition ${
                selected
                    ? 'border-green-700 bg-green-50 text-green-800'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-500'
            }`}
            aria-pressed={selected}
        >
            {label}
        </button>
    );
}
