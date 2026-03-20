import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const ReviewSkeleton = () => {
  return (
    <div className='space-y-4'>
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className='grid gap-4'>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='space-y-3 flex-1'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <Skeleton className="h-4 w-24" />
                <div className='bg-muted/50 p-4 rounded-lg space-y-2'>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-[90%]" />
                  <Skeleton className="h-3 w-[80%]" />
                </div>
                <Skeleton className="h-10 w-44" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}