'use client'
import React,{useState} from 'react'
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {
getConnectedRepositories,disconnectRepository,disconnectAllRepositories} from '@/modules/settings/actions'
import{Card,CardContent,CardDescription,CardHeader,CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {toast} from 'sonner'
import {ExternalLink,Trash2,AlertTriangle} from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { set } from 'zod'
import { Separator } from '@/components/ui/separator'

const RepositoryList = () => {
    const queryClient = useQueryClient()
    const[disconnectedAllOpen,setDisconnectedAllOpen] = useState(false)

    const {data: repositories, isLoading, isError} = useQuery({
        queryKey: ['connected-repositories'],
        queryFn: async () => await getConnectedRepositories(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false
    })
    
    const disconnectMutation = useMutation({
        mutationFn: async (repoId: string) => {
            return await disconnectRepository(repoId)
        },
        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({
                    queryKey: ['connected-repositories']
                }),
                queryClient.invalidateQueries({
                    queryKey: ['dashboard-stats']
                }),
            
                toast.success("Repository disconnected successfully")
            }else {
                toast.error(result.error ||"Failed to disconnect repository")
            }
        },
        onError: (error) => {
            toast.error(`Failed to disconnect repository: ${error.message}`)
        }
    })


    const disconnectAllMutation = useMutation({
        mutationFn: async () => {
            return await disconnectAllRepositories()
        },
        onSuccess: (result) => {
            if (result?.success) {  
                queryClient.invalidateQueries({
                    queryKey: ['connected-repositories']
                }),
                queryClient.invalidateQueries({
                    queryKey: ['dashboard-stats']
                }),
                toast.success(`All repositories disconnected successfully. Total: ${result.count}`)
                setDisconnectedAllOpen(false)
            }
            else {
                toast.error(result.error || "Failed to disconnect all repositories")
            }
        },
        onError: (error) => {
            toast.error(`Failed to disconnect all repositories: ${error.message}`)
        }
    })

    if (isLoading) {
        return (
            <Card>  
                <CardHeader>
                    <CardTitle>Connected Repositories</CardTitle>
                    <CardDescription>manage your connected repositories.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='animated-pulse space-y-4'>
                        <div className='h-20 bg-muted rounded'></div>
                        <div className='h-20 bg-muted rounded'></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

  return (  
    <Card>
        <CardHeader className='flex items-center justify-between'>
            <div className=''>
            <CardTitle>Connected Repositories</CardTitle>
            <CardDescription> manage your connected repositories.</CardDescription>          
            </div>
            {repositories && repositories.length > 0 && (
                <>
                <AlertDialog open={disconnectedAllOpen} onOpenChange={setDisconnectedAllOpen}>
                    <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                        <Trash2 className='mr-2 h-4 w-4' />
                        Disconnect All
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className='flex items-center gap-2'>
                                <AlertTriangle className='h-4 w-4' />
                                Disconnect All Repositories?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This will disconnect all {repositories.length} connected repositories and remove all associated data. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => disconnectAllMutation.mutate()}
                                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                disabled={disconnectAllMutation.isPending}>
                                {
                                    disconnectAllMutation.isPending ? "Disconnecting..." : "Disconnect All"
                                }
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                {/* <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={disconnectAllMutation.isPending}>
                        Disconnect All
                    </Button>
                </AlertDialogTrigger> */}
                </AlertDialog>
                </>
            )}
        </CardHeader>
        <Separator className="bg-accent" />
        <CardContent>
            {repositories && repositories.length > 0 ? (
                <div className="space-y-4">
                    {repositories.map((repo) => (
                        <div key={repo?.id} className="flex items-center justify-between p-4 border rounded
                            hover:bg-muted/50 transition-colors">
                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2'>
                                <h3 className="font-semibold truncate">{repo.fullName}</h3>
                                <a href={repo?.url} target="_blank" rel="noopener noreferrer"
                                className='text-muted-foreground hover:text-foreground'> 
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                                </div>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm"
                                    className='ml-4 text-destructive hover:text-destructive hover:bg-destructive/10'
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Disconnect
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Disconnect Repository?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will disconnect <strong>{repo.fullName}</strong> from the application and remove all associated data. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => disconnectMutation.mutate(repo.id)}
                                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                            disabled={disconnectMutation.isPending}>
                                            {
                                                disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"
                                            }
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-muted-foreground text-center py-8">
                    <p>
                    No connected repositories found.
                    </p>
                    <p className='text-sm text-muted-foreground'>
                        Connect a repository to get started.
                    </p>
                </div>
            )}
        </CardContent>
    </Card>
  )
}

export default RepositoryList