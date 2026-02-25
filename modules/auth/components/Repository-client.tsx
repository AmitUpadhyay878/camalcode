'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, Star, Search } from 'lucide-react'
import { useRepositories } from '@/modules/repository/hooks/use-repositories'
import { RepositoryListSkeleton } from '@/modules/repository/components/RepositoryListSkeleton'
import { renderLanguageBadge } from '@/utils/utilsFunctions'
import { useConnectRepository } from '@/modules/repository/hooks/use-connect-repository'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics: string[]
  private?:boolean
  isConnected?: boolean
}

const RepositoryClient = () => {

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useRepositories()

  const {mutate:connectRepo} = useConnectRepository()

  const [searchQuery, setSearchQuery] = useState("")
  const [localConnectingId, setLocalConnectingId] = useState<number | null>(null)

  const observerTarget = useRef<HTMLDivElement | null>(null)

  const isSearching = searchQuery.trim().length > 0

  const allRepositories: Repository[] = useMemo(
    () => data?.pages?.flatMap((page) => page) || [],
    [data]
  )
  const filteredRepositories = useMemo(() => {
    if (!isSearching) return allRepositories

    return allRepositories.filter((repo: Repository) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allRepositories, searchQuery, isSearching])

  useEffect(() => {

    if (isSearching) return  

    if (!observerTarget.current) return

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0]

      if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }, { threshold: 0.1 })

    const el = observerTarget.current
    observer.observe(el)

    return () => observer.disconnect()

  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isSearching])

  const handleConnected = (repo: Repository) => {
    setLocalConnectingId(repo?.id)
    connectRepo({
      owner:repo?.full_name.split("/")[0],
      repo:repo?.name,
      githubId:repo?.id
    },{
      onSettled:()=>setLocalConnectingId(null)
    })
  }

  if(isError){
    return <div>Fail to load repositories</div>
  }

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Repositories</h1>
        <p className='text-muted-foreground underline'>
          Manage and view all your Github repositories
        </p>
      </div>

      <div className='relative'>
        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          className='pl-8'
          placeholder='Search repositories...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className='grid gap-4'>
        {isLoading && <RepositoryListSkeleton />}

        {!isLoading && filteredRepositories.map((repo) => {
          return(
            <Card key={repo.id} className='hover:shadow-md transition-shadow'>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='space-y-2 flex-1'>
                    <div className='flex items-center gap-2'>
                      <CardTitle className='text-lg'>{repo.name}</CardTitle>
  
                         {renderLanguageBadge(repo.language)}
                      {repo?.private ? (<Badge>Private</Badge>):(<Badge variant="destructive">Public</Badge>)}
                      {repo.isConnected && (
                        <Badge variant="secondary">Connected</Badge>
                      )}
                    </div>
  
                    <CardDescription>
                      {repo.description || "No description provided"}
                    </CardDescription>
                  </div>
  
                  <div className='flex gap-2'>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={repo?.html_url} target='_blank' rel="noopener noreferrer">
                        <ExternalLink className='h-4 w-4' />
                      </a>
                    </Button>
  
                    <Button
                      onClick={() => handleConnected(repo)}
                      disabled={localConnectingId === repo?.id || repo?.isConnected}
                      variant={repo?.isConnected ? "outline" : "default"}
                    >
                      {localConnectingId === repo?.id
                        ? "Connecting..."
                        : repo?.isConnected
                          ? "Connected"
                          : "Connect"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
  
              <CardContent>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-1'>
                    <Star className='h-4 w-4 fill-primary text-primary' />
                    <span className='text-sm font-medium'>
                      {repo?.stargazers_count}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }
          )
        }

        {!isLoading && filteredRepositories.length === 0 && (
          <p className='text-center text-muted-foreground'>
            No Repository Found
          </p>
        )}

      </div>

      {!isSearching && (
        <div className='space-y-4'>

          {isFetchingNextPage && <RepositoryListSkeleton />}

          {!hasNextPage && allRepositories.length > 0 && (
            <p className='text-center text-muted-foreground'>
              No More Repositories
            </p>
          )}

          <div ref={observerTarget} className='h-2' />
        </div>
      )}

    </div>
  )
}

export default RepositoryClient
