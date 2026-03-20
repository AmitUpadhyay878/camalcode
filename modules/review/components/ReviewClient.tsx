'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { getReviews } from '@/modules/review/actions'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Clock, CheckCircle2, XCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown';
import { ReviewSkeleton } from './review-skeleton'

const ReviewClient = () => {

    const { data: reviews, isLoading } = useQuery({
        queryKey: ["reviews"],
        queryFn: async () => {
            return await getReviews()
        }
    })

    if (isLoading) {
        return <ReviewSkeleton />
    }

    const reviewStatus = (status: any) => {
        switch (status) {
            case "completed":
                return (<Badge variant="default" className='gap-1'>
                    <CheckCircle2 className='h-3 w-3' />
                    Completed
                </Badge>)
            
            case "failed":
                return (<Badge variant="destructive" className='gap-1'>
                    <XCircle className='h-3 w-3' />
                    Failed
                </Badge>)
                
            case "pending":
                return (<Badge variant="secondary" className='gap-1'>
                    <Clock className='h-3 w-3' />
                    Pending
                </Badge>)
              

            default:
                break;
        }
    }

    return (
        <div className='space-y-4'>
            <div className=''>
                <h1 className='text-2xl font-bold tracking-tight'>Review History</h1>
                <p className='text-muted-foreground underline'>View all AI reviews</p>
            </div>

            {
                reviews?.length === 0 ? (
                    <Card>
                        <CardContent className='pt-6'>
                            <div className='text-center py-4'>
                                <p className='text-muted-foreground'>No reviews yet. Connect repository and open a PR to generate review.</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className='grid gap-4'>
                        {
                            reviews?.map((review: any) => {
                                return (
                                    <Card key={review?.id} className='hover:shadow-md transition-shadow'>
                                        <CardHeader>
                                            <div className='flex items-start justify-between'>
                                                <div className='space-y-2 flex-1'>
                                                    <div className='flex items-center gap-2'>
                                                        <CardTitle>{review?.prTitle}</CardTitle>
                                                        {reviewStatus(review?.status)}
                                                    </div>
                                                    <CardDescription>
                                                        {review?.repository?.fullName} PR #{review?.prNumber}
                                                    </CardDescription>
                                                </div>
                                                <Button variant="ghost" asChild size="icon">
                                                    <a href={review?.prUrl} target='_blank' rel='noopener noreferrel'>
                                                        <ExternalLink className='h-4 w-4'/>
                                                    </a>
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className='space-y-4'>
                                                <div className='text-sm text-muted-foreground'>
                                                    {formatDistanceToNow(new Date(review?.createdAt),{addSuffix:true})}
                                                </div>
                                                <div className='prose prose-sm dark-prose-invert max-w-none'>
                                                    <div className='bg-muted p-4 rounded-lg'>
                                                        <pre className='whitespace-pre-wrap text-xs'>
                                                            <ReactMarkdown>{review?.review.substring(0,310)}</ReactMarkdown> ...  
                                                        </pre>
                                                    </div>
                                                </div>
                                                <Button variant="outline" asChild>
                                                    <a href={review?.prUrl}  target='_blank' rel='noopener noreferrel'>
                                                        View Full Review on Github
                                                    </a>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        }
                    </div>
                )
            }
        </div>
    )
}

export default ReviewClient