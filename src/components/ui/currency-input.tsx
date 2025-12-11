import * as React from "react";
import { cn } from "./utils";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number;
  onChange: (value: number) => void;
}

// Format number with thousand separators using toLocaleString
const formatCurrency = (value: number): string => {
  if (value === 0 || !value) return "";
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

// Parse formatted string back to number, removing commas
const parseCurrency = (formatted: string): number => {
  // Remove all commas and spaces
  const cleaned = formatted.replace(/,/g, '').trim();

  // If empty, return 0
  if (cleaned === '') return 0;

  // Parse to float
  const parsed = parseFloat(cleaned);

  // Return parsed value or 0 if NaN, ensure non-negative
  return Math.max(0, isNaN(parsed) ? 0 : parsed);
};

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, onChange, value, placeholder, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>(
      value ? formatCurrency(value) : ""
    );

    // Update display when value prop changes (e.g., from API or AI autofill)
    React.useEffect(() => {
      if (value) {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow only digits, comma, and decimal point
      const filtered = inputValue.replace(/[^\d,.\s]/g, '');

      // Prevent multiple decimal points
      const parts = filtered.split('.');
      let validInput = parts[0];
      if (parts.length > 1) {
        validInput += '.' + parts[1];
      }

      // Remove commas for parsing
      const numericValue = parseCurrency(validInput);

      // Update display value with formatted version
      if (validInput === '' || validInput === '.' || validInput === ',') {
        setDisplayValue('');
        onChange(0);
      } else {
        setDisplayValue(validInput);
        onChange(numericValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Format the value on blur
      const numericValue = parseCurrency(displayValue);
      if (numericValue > 0) {
        setDisplayValue(formatCurrency(numericValue));
      } else {
        setDisplayValue('');
      }
      onChange(numericValue);

      // Call original onBlur if provided
      props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Keep formatted display on focus to allow editing
      props.onFocus?.(e);
    };

    return (
      <input
        type="text"
        inputMode="decimal"
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        placeholder={placeholder || "0.00"}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        ref={ref}
        {...props}
      />
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
