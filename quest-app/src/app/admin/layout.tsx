import { ReactNode } from 'react'
import AuthGuard from '@/components/authGuard'
import AdminNavbar from '@/components/ui/adminNavbar'
import { DataProvider } from '@/context/dataContext'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <AuthGuard adminOnly={true}>
          <AdminNavbar />
          <main className='pt-20'>{children}</main>
      </AuthGuard>
    </DataProvider>
  )
}