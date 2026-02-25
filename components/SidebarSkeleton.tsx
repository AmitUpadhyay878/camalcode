'use client'
import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

const SidebarSkeleton = () => {
    return (
        <Sidebar>
            <SidebarHeader className='border-b'>
                <div className='flex flex-col px-2 py-6 gap-4'>
                    <div className='flex items-center gap-4 px-3 py-2'>
                        <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                        <div className='flex-1 space-y-2'>
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className='px-3 py-6 flex flex-col gap-4'>
                <div className="mb-2">
                    <Skeleton className="h-3 w-12 ml-3 mb-4" /> {/* "Menu" Label */}
                    <div className="space-y-6 px-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 px-2">
                                <Skeleton className="h-5 w-5 rounded-md shrink-0" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            </SidebarContent>
            <SidebarFooter className='border-t px-3 py-4'>
                <div className="flex items-center gap-3 px-4 h-12">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2 w-28" />
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}

export default SidebarSkeleton