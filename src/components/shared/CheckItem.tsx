import { useState } from "react";

interface CheckItemProps {
  text: string;
  warning?: boolean;
}

export function CheckItem({ text, warning = false }: CheckItemProps) {
  const [checked, setChecked] = useState(false);

  const bgColor = checked
    ? warning
      ? "bg-form-izen/10"
      : "bg-correct/10"
    : "bg-transparent";

  const borderColor = checked
    ? warning
      ? "border-form-izen"
      : "border-correct"
    : "border-border";

  const boxBg = checked
    ? warning
      ? "bg-form-izen"
      : "bg-correct"
    : "bg-transparent";

  const boxBorder = warning ? "border-form-izen" : "border-correct";

  return (
    <button
      type="button"
      onClick={() => setChecked((c) => !c)}
      className={`flex items-start gap-2 px-2.5 py-2 border rounded-lg transition-all text-left w-full ${bgColor} ${borderColor}`}
    >
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${boxBg} ${boxBorder}`}
      >
        {checked && <span className="text-white text-[10px] font-bold">✓</span>}
      </div>
      <span className="text-xs leading-relaxed text-sumi-dark">{text}</span>
    </button>
  );
}
