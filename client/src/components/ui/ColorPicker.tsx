import { cn } from '@/lib/utils';

export interface ColorOption {
  name: string;
  value: string;
  class: string;
}

export const TASK_COLORS: ColorOption[] = [
  { name: 'Red', value: '#FF3B30', class: 'bg-[#FF3B30]' },
  { name: 'Orange', value: '#FF9500', class: 'bg-[#FF9500]' },
  { name: 'Yellow', value: '#FFCC00', class: 'bg-[#FFCC00]' },
  { name: 'Green', value: '#34C759', class: 'bg-[#34C759]' },
  { name: 'Teal', value: '#5AC8FA', class: 'bg-[#5AC8FA]' },
  { name: 'Blue', value: '#007AFF', class: 'bg-[#007AFF]' },
  { name: 'Indigo', value: '#5856D6', class: 'bg-[#5856D6]' },
  { name: 'Purple', value: '#AF52DE', class: 'bg-[#AF52DE]' },
  { name: 'Pink', value: '#FF2D55', class: 'bg-[#FF2D55]' },
  { name: 'Brown', value: '#A2845E', class: 'bg-[#A2845E]' },
  { name: 'Gray', value: '#8E8E93', class: 'bg-[#8E8E93]' },
];

interface ColorPickerProps {
  value?: string | null;
  onChange: (color: string | null) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Clear color option */}
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'w-8 h-8 rounded-md border-2 flex items-center justify-center transition-all',
          !value
            ? 'border-primary bg-muted'
            : 'border-muted-foreground/20 hover:border-muted-foreground/40'
        )}
        title="No color"
      >
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Color options */}
      {TASK_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={cn(
            'w-8 h-8 rounded-md border-2 transition-all relative',
            color.class,
            value === color.value
              ? 'border-primary ring-2 ring-primary ring-offset-2'
              : 'border-transparent hover:border-muted-foreground/40'
          )}
          title={color.name}
        >
          {value === color.value && (
            <svg
              className="w-4 h-4 text-white absolute inset-0 m-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
