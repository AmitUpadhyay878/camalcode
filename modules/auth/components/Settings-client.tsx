'use client'
import React from 'react'
import { ProfileForm } from '@/modules/settings/components/profile-form'
import RepositoryList from '@/modules/settings/components/repository-list'

const SettingsClient = () => {
  return (
    <div className='space-y-6'>
         <div>
        <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground underline'>
          Manage your Account Settings and connected repositories
        </p>
      </div>
      <div>
        <ProfileForm />
        <RepositoryList/>
      </div>
    </div>
  )
}

export default SettingsClient