import { AnimatedOutlet } from './AnimatedOutlet'

export function Layout() {
  return (
    <div className="shell">
      <main className="main">
        <AnimatedOutlet />
      </main>
    </div>
  )
}
