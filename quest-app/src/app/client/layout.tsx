import { ReactNode } from 'react'
import AuthGuard from '@/components/authGuard'
import { QuestProvider } from '@/context/questContext'
import { DataProvider } from '@/context/dataContext'

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    // <AuthGuard>
    <QuestProvider>
        <DataProvider>
          {children}
        </DataProvider>
    </QuestProvider>
    // </AuthGuard>
  )
}