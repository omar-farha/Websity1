/** A radial highlight that follows the cursor, revealed on hover.
 * Absolutely positioned — the parent must be `relative`/`group` and set
 * `--spot-x`/`--spot-y` (in px, relative to itself) on mouse move, e.g.:
 *   onMouseMove={(e) => {
 *     const r = e.currentTarget.getBoundingClientRect();
 *     e.currentTarget.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
 *     e.currentTarget.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
 *   }}
 */
export function Spotlight({ color = "#0fd8d7" }: { color?: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        background: `radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${color}22, transparent 70%)`,
      }}
    />
  );
}
