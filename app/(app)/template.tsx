/**
 * Page transition template for the dApp.
 *
 * A CSS-only fade: it starts painting as soon as the HTML and CSS arrive, unlike a
 * framer-motion `initial={{ opacity: 0 }}`, which is server-rendered as
 * `opacity:0` and keeps the page invisible until hydration finishes.
 * Opacity-only to keep GPU pressure low on Safari iOS.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-[fade-in_0.3s_cubic-bezier(0.16,1,0.3,1)]">{children}</div>;
}
