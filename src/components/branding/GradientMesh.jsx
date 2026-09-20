export default function GradientMesh() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-primary/25 blur-3xl dark:bg-primary/20 motion-reduce:blur-2xl" />
      <div className="absolute -right-16 top-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl dark:bg-primary/15" />
      <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#C4A35A]/20 blur-3xl dark:bg-[#C4A35A]/10" />
    </div>
  )
}
