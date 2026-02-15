'use client'
import React, { useState, useEffect, use } from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useSession } from '@/lib/auth-client'
import Logout from '@/modules/auth/components/logout'
import { Github, BookOpen, Settings, Moon, Sun, LogOut, CardSim, SearchIcon, MoveRightIcon, User } from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator
} from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const DashboardSidebar = () => {

    const { theme, setTheme } = useTheme()
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()
    const { data: session } = useSession()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const NavbarItems = [
        { title: 'Dashboard', url: '/dashboard', icon: BookOpen },
        { title: 'Repository', url: '/dashboard/repository', icon: Github },
        { title: 'Review', url: '/dashboard/review', icon: SearchIcon },
        { title: 'Subscriptions', url: '/dashboard/subscriptions', icon: CardSim },
        { title: 'Settings', url: '/dashboard/settings', icon: Settings }
    ]


    const isActive = (url: string) => {
        // return pathname === url || pathname.startsWith(url + '/dashboard')
        return pathname === url || pathname.startsWith(url + '/')
    }

    if (!isMounted || !session) return null

    const user = session?.user
    const userName = user?.name || 'User'
    const userEmail = user?.email || ''
    // const userInitials = userName.charAt(0).toUpperCase()
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase()
    const userImage = user?.image || '/default-avatar.png'

    return (
        <Sidebar>
            <SidebarHeader className='border-b'>
                <div className='flex flex-col px-2 py-6 gap-4'>
                    <div className='flex items-center gap-4 px-3 py-2 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors cursor-pointer'>
                        <div className='flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground shrink-0'>
                            <Github className='w-6 h-6' />
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='text-xs font-semibold text-sidebar-foreground tracking-wide'>Connected Account</p>
                            <p className='text-xs font-medium text-sidebar-foreground/90'>@{userName}</p>
                        </div>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className='px-3 py-6 flex-col gap-1'>
                <div className='mb-2'>
                    <p className='text-xs font-semibold text-sidebar-foreground/60 px-3 mb-3 uppercase tracking-wide'>Menu</p>
                </div>
                <SidebarMenu className='gap-2'>
                    {
                        NavbarItems.map((item) => (
                            <SidebarMenuItem key={item?.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item?.title}
                                    className={`
                                        h-11 px-4 rounded-lg transition-all duration-200
                                        ${isActive(item?.url)
                                            ?
                                            'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                                            :
                                            'hover:bg-sidebar-accent/60 text-sidebar-accent-foreground'
                                        }`}>
                                    <Link
                                        href={item?.url}
                                        className='flex items-center gap-3'
                                    >
                                        <item.icon className='w-5 h-5 shrink-0' />
                                        <span className='text-sm font-medium'>{item?.title}</span>
                                    </Link>

                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))
                    }
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className='border-t px-3 py-4'>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className='w-full'>
                                <SidebarMenuButton
                                    className='h-12 px-4 rounded-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors'
                                    size={"lg"}
                                >
                                    <Avatar className='h-6 w-6 rounded-lg shrink-0'>
                                        <AvatarImage src={userImage} alt={userName} />
                                        <AvatarFallback className='rounded-lg'>{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div className='grid flex-1 text-left text-sm leading-relaxed min-w-0'>
                                        <span className='truncate text-sm'>{userName}</span>
                                        <span className='truncate text-xs text-sidebar-foreground/70'>{userEmail}</span>
                                    </div>
                                    <MoveRightIcon className='w-2 h-2 ml-1' />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-50 rounded-lg' align='end' side='right' sideOffset={8}>
                                <div className='px-2 py-3'>
                                    <DropdownMenuItem 
                                        className='w-full border-b mb-2 px-3 flex items-center gap-3 rounded-lg hover:bg-sidebar-accent/50 text-sm font-medium transition-colors'
                                    >
                                          <Avatar className='h-6 w-6 rounded-lg shrink-0'>
                                        <AvatarImage src={userImage} alt={userName} />
                                        <AvatarFallback className='rounded-lg'>{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div className='grid flex-1 text-left text-sm leading-relaxed min-w-0'>
                                        <span className='truncate text-sm'>{userName}</span>
                                    </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <button
                                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                            className='w-full px-3 flex items-center gap-3 rounded-lg hover:bg-sidebar-accent/50 text-sm font-medium transition-colors'
                                        >
                                            {theme === 'light' ? <> <Moon className='w-4 h-4 shrink-0' /> <span>Dark Mode</span> </> : <><Sun className='w-4 h-4 shrink-0' /> <span>Light Mode</span></>}
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild
                                        className='cursor-pointer px-3 py-3 my-1 rounded-md hover:bg-red-500/10 text-sm
  hover:text-red-600 transition-colors font-medium'
                                    >
                                        <Logout className='w-full flex items-center gap-3'>
                                            <LogOut className='w-5 h-5 shrink-0' />
                                            Sign out
                                        </Logout>
                                    </DropdownMenuItem>

                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>

            </SidebarFooter>
        </Sidebar>
    )
}

export default DashboardSidebar