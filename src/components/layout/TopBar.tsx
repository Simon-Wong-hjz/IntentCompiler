export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border-default bg-bg-surface px-5 h-12">
      <h1
        className="text-xl font-extrabold text-ink-primary"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Intent Compiler
      </h1>

      <nav className="flex items-center gap-4">
        <button
          className="text-sm font-medium text-ink-secondary hover:text-ink-primary cursor-not-allowed opacity-60"
          disabled
        >
          历史
        </button>
        <button
          className="text-sm font-medium text-ink-secondary hover:text-ink-primary cursor-not-allowed opacity-60"
          disabled
        >
          设置
        </button>
        <div className="flex items-center rounded-sm border border-border-default text-sm">
          <span className="px-2 py-0.5 bg-ink-primary text-accent-primary font-medium rounded-l-sm">
            中
          </span>
          <span className="px-2 py-0.5 text-ink-muted font-medium rounded-r-sm">
            EN
          </span>
        </div>
      </nav>
    </header>
  );
}
