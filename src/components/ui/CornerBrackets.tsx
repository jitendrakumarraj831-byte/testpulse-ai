interface CornerBracketsProps {
  colorClass: string;
  /** Render at full opacity instead of only on hover — for HUD panels that have no hover state of their own. */
  alwaysVisible?: boolean;
}

export function CornerBrackets({ colorClass, alwaysVisible = false }: CornerBracketsProps) {
  const visibility = alwaysVisible
    ? "opacity-100"
    : "opacity-0 transition-opacity duration-300 group-hover:opacity-100";
  const shared = `pointer-events-none absolute h-4 w-4 ${colorClass} ${visibility}`;

  return (
    <>
      <span className={`${shared} top-3 left-3 border-t-2 border-l-2`} />
      <span className={`${shared} top-3 right-3 border-t-2 border-r-2`} />
      <span className={`${shared} bottom-3 left-3 border-b-2 border-l-2`} />
      <span className={`${shared} bottom-3 right-3 border-b-2 border-r-2`} />
    </>
  );
}
