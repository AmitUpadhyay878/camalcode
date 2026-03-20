
import { polarClient } from '@polar-sh/better-auth'
import {createAuthClient} from 'better-auth/react'

export const {signIn, signUp, signOut, useSession, customer, checkout} = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    plugins:[
        polarClient()
    ]
})