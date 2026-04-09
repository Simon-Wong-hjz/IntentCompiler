interface SpotlightOverlayProps {
  targetRect: DOMRect | null;
  padding?: number;
}

export function SpotlightOverlay({ targetRect, padding = 8 }: SpotlightOverlayProps) {
  if (!targetRect) return null;

  const x = targetRect.left - padding;
  const y = targetRect.top - padding;
  const w = targetRect.width + padding * 2;
  const h = targetRect.height + padding * 2;

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none"
      data-testid="spotlight-overlay"
    >
      <div
        className="absolute rounded-lg transition-all duration-300 ease-in-out"
        style={{
          left: x,
          top: y,
          width: w,
          height: h,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
        }}
      />
    </div>
  );
}
