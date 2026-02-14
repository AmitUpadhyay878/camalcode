import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator';
import DashboardSidebar from '@/components/sidebar';
import { requireAuth } from '@/modules/auth/utils/auth-utils';

export default async function ProtectedLayout({children}: {children: React.ReactNode}) {
  await requireAuth() 
  return(
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='p-1' />
          <Separator orientation='vertical' className='mx-2 h-4' />
          <h1 className='text-xl font-semibold text-foreground'>Dashboard</h1>
        </header>
        <main className='flex-1 overflow-y-auto p-4 md:p-6 lg:p-8'>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}