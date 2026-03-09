'use client'
import React, { use, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserProfile, updateUserProfile } from '@/modules/settings/actions'
import { Card, CardDescription, CardContent, CardTitle, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

export function ProfileForm() {

  const queryClient = useQueryClient()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => await getUserProfile(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })

  useEffect(() => {
    if (profile) {
      setName(profile?.name || "")
      setEmail(profile?.email || "")
    }
  },[profile])

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string, email: string }) => {
      return await updateUserProfile(data)
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({
          queryKey: ['user-profile']
        }),
          toast.success("Profile updated successfully")
      }
    },
    onError: (error) => {
      toast.error(`Profile updation have issue: ${error.message}`)
    }
  })

  const handleSubmit = (e:React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault()
      updateMutation.mutate({name,email})
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Please wait while we Updating your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='animated-pulse space-y-4'>
            <div className='h-10 bg-muted rounded'></div>
            <div className='h-10 bg-muted rounded'></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return(
    <Card className='mb-4'>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your profile information.</CardDescription>
        </CardHeader>
        <Separator className="bg-accent"/>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                placeholder='Enter your name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                 disabled={updateMutation.isPending}
              />
            </div>
            <div>
              <Button type='submit' disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
  )
}