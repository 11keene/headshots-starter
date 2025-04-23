// app/overview/layout.tsx
import { redirect } from 'next/navigation'
  import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
  import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function OverviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    +    redirect('/login');
  }

  return <>{children}</>
}
