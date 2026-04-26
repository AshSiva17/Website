import { Outlet, useLocation } from 'react-router-dom'

export function AnimatedOutlet() {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className="route-fade">
      <Outlet />
    </div>
  )
}
