import { Outlet } from 'react-router-dom'
import { useActiveScrutinQuery } from '../modules/student-vote/hooks'

export function StudentVotePage() {
  useActiveScrutinQuery()

  return (
    <main className="mx-auto w-full max-w-[980px] px-4 md:px-8">
      <section className="w-full">
        <Outlet />
      </section>
    </main>
  )
}
