'use client'
import React,{useState} from 'react'
import {signIn} from '@/lib/auth-client'
import {Github, GithubIcon} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'


const LoginUI = () => {
    const [isLoading, setIsLoading] = useState(false)

    const handleGithubLogin = async () => {
        setIsLoading(true)
        try {
            await signIn.social({
                provider: 'github',
            })
        } catch (error) {
            console.error('Login failed:', error)
            setIsLoading(false)
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-black to-zinc-900 text-white flex">
      {/* left section */}
        <div className="flex flex-1 flex-col justify-center px-12 py-16">
           <div className='max-w-lg'>
            <div className='mb-16'>
                <div className='inline-flex items-center gap-2 text-2xl font-bold'>
                    <div className='w-8 h-8 bg-primary flex items-center justify-center rounded-full'>
                        <Image src="/camalcodelogo.png" alt="CamalCode Logo" width={28} height={28} className='rounded-full'/>
                    </div>
                            <span className=''>CamalCode</span>
                    </div>

                    {/* main content */}
                    <h1 className='text-5xl font-bold mb-6 leading-tight text-balance'>
                      Cut Code Review Time & Bugs in Half <span className='block'>Instantly.</span>
                    </h1>
                    <p className='text-lg text-gray-400 mb-8'>
                    CamalCode is an AI-powered code review assistant that helps developers save time and reduce bugs by providing intelligent code analysis and suggestions.
                    </p>
                </div>
            </div>
           </div>
           

      {/* right section  */}
        <div className="flex flex-1 flex-col items-center justify-center px-12 py-16">
            <div className='w-full max-w-sm'>
                <div className='mb-12'>
                      <h2 className='text-3xl font-bold mb-4'>Welcome Back</h2>
                      <p className='text-gray-400'>Login to your account to continue</p>   
                </div>
                    <button
                        onClick={handleGithubLogin}
                        disabled={isLoading}
                        className='
                            w-full py-3 px-4 bg-primary cursor-pointer text-black rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-8 transition-colors'
                    >
                        <GithubIcon size={20}/>
                        {isLoading ? 'Logging in...' : 'Login with GitHub'}
                    </button>
                    
                    {/* footer links */}
                    <div className='space-y-4 text-center text-sm text-gray-400 mt-6'>
                        <div>
                            New to CamalCode? <a href="#" className='text-primary'>Sign Up</a>
                        </div>
                        <div>
                            <a href="#" className='text-primary font-semibold'>Self-Hosted Services</a>
                        </div>
                    </div>
                    <Separator className='my-4 bg-gray-800'/>

                    {/* bottom links */}
                    <div className='flex items-center justify-center gap-4 mt-8 text-gray-500 text-sm'>
                        <Link href="/privacy-policy" className='hover:text-gray-400'>Privacy Policy</Link>
                        <span>|</span>
                        <Link href="/terms-of-services" className='hover:text-gray-400'>Terms of Service</Link>
                    </div>
            </div>
            </div>
    </div>
  )
}

export default LoginUI