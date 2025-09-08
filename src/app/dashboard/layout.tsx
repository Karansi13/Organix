import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()

  if (!userId) {
    redirect('/')
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
