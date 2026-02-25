'use client'
import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'

// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend,
//     ResponsiveContainer
// } from 'recharts'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'


import {
    GitCommit,
    GitPullRequest,
    MessagesSquare,
    GitBranch
} from 'lucide-react'

import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getMonthlyActivity } from '@/modules/dashboard/actions'
import ContributionGraph from './ContributionGraph'
import { Spinner } from '@/components/ui/spinner'

const DashboardClient = () => {

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => await getDashboardStats(),
        refetchOnWindowFocus: false
    })

    const { data: monthlyActivity, isLoading: isLoadingMonthlyActivity } = useQuery({
        queryKey: ['monthly-activity'],
        queryFn: async () => await getMonthlyActivity(),
        refetchOnWindowFocus: false
    })

    return (
        <div className='space-y-6'>
            <div>
                <div className='text-2xl font-bold tracking-tight'>
                    Dashboard
                </div>
                <p className='text-muted-foreground underline'>
                    Overview of your coding activity and AI reviews
                </p>
            </div>
            <div className='grid gap-4 md:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Total Repositories</CardTitle>
                        <GitBranch className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {isLoading ? "..." : stats?.totalRepo || 0}
                        </div>
                        <p className='text-xs text-muted-foreground'>Connected Repositories</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Total Commits</CardTitle>
                        <GitCommit className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {isLoading ? "..." : (stats?.totalCommites || 0)}
                        </div>
                        <p className='text-xs text-muted-foreground'>In the last year</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Pull Requests</CardTitle>
                        <GitPullRequest className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {isLoading ? "..." : (stats?.totalPRs || 0)}
                        </div>
                        <p className='text-xs text-muted-foreground'>All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Pull Reviews</CardTitle>
                        <MessagesSquare className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {isLoading ? "..." : (stats?.totalReviews || 0)}
                        </div>
                        <p className='text-xs text-muted-foreground'>Generated reviews</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className=''>Contribution Activity</CardTitle>
                    <CardDescription>Visualizing your coding frequency over the last year</CardDescription>
                </CardHeader>
                <CardContent>
                    <ContributionGraph />
                </CardContent>
            </Card>
            <div className='grid gap-4 md:grid-cols-2'>
                <Card className='col-span-2'>
                    <CardHeader>
                        <CardTitle>Activity Overview</CardTitle>
                        <CardDescription>Monthly breakdown of commits, PRs, and review (last 6 months)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {
                            isLoadingMonthlyActivity ? (
                                <div className='h-80 w-full flex items-center justify-center'>
                                    <Spinner className='h-10 w-10' />
                                </div>
                            ) : (
                                <div className='h-80 w-full'>
                                    {/* <ResponsiveContainer
                                            width={"100%"}
                                            height={"100%"}
                                        >
                                            <BarChart
                                            data={monthlyActivity || []}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name"/>
                                                <YAxis  />
                                                <Tooltip
                                                    contentStyle={{
                                                        background:'var(--background)',
                                                        borderColor:'var(--border)'
                                                    }}
                                                    itemStyle={{color:'var(--foreground)'}}
                                                />
                                                <Legend />
                                                <Bar dataKey="commits" name="Commits" fill='#3b82f6' radius={[4,4,0,0]} />
                                                <Bar dataKey="prs" name="Pull Requests" fill='#8b5cf6' radius={[4,4,0,0]} />
                                                <Bar dataKey="reviews" name="AI Reviews" fill='#10b981' radius={[4,4,0,0]} />
                                            </BarChart>
                                        </ResponsiveContainer> */}

                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyActivity || []}>

                                            {/* <CartesianGrid strokeDasharray="1 1" /> */}

                                            <XAxis dataKey="name" />

                                            <YAxis />

                                            <Tooltip
                                                contentStyle={{
                                                    background: 'var(--background)',
                                                    borderColor: 'var(--border)'
                                                }}
                                                itemStyle={{ color: 'var(--foreground)' }}
                                            />

                                            <Legend />

                                            {/* Commits */}
                                            <Line
                                                type="monotone"
                                                dataKey="commits"
                                                name="Commits"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />

                                            {/* PRs */}
                                            <Line
                                                type="monotone"
                                                dataKey="prs"
                                                name="Pull Requests"
                                                stroke="#8b5cf6"
                                                strokeWidth={3}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />

                                            {/* Reviews */}
                                            <Line
                                                type="monotone"
                                                dataKey="reviews"
                                                name="AI Reviews"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />

                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DashboardClient