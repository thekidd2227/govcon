export function SectionEyebrow({ index, label }: { index: string; label: string }) {
  return (
    <span className="eyebrow">
      {index} / {label}
    </span>
  );
}
