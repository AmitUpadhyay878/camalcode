'use server'

import prisma from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { gerRemainingLimits, updateUserTier } from '@/modules/payment/lib/subscription'
import { polarClient } from '@/modules/payment/config/polar'


export interface SubscriptionData {
    user: {
        id: string;
        name: string;
        email: string;
        subscriptionTier: string;
        subscriptionStatus: string | null;
        polarCustomerId: string | null;
        polarSubscriptionId: string | null;
    } | null;
    limits: {
        tier: "FREE" | "PRO";
        repositories: {
            current: number;
            limit: number | null;
            canAdd: boolean;
        };
        reviews: {
            [repositoryId: string]: {
                current: number;
                limit: number | null;
                canAdd: boolean;
            }
        }
    } | null;

}


export async function getSubscriptionData(): Promise<SubscriptionData> {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        return { user: null, limits: null }
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session?.user?.id
        }
    })

    if (!user) {
        return { user: null, limits: null }
    }

    const limits = await gerRemainingLimits(user?.id)

    return {
        user: {
            id: user?.id,
            name:user?.name,
            email:user?.email,
            subscriptionTier:user?.subscriptionTier || "FREE",
            subscriptionStatus:user?.subscriptionStatus || null,
            polarCustomerId:user?.polarCustomerId || null,
            polarSubscriptionId:user?.polarSubscriptionId || null
        },
        limits
    }
}

export async function syncSubscriptionStatus(){
     const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        return { user: null, limits: null }
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session?.user?.id
        }
    })

    if (!user || !user?.polarCustomerId) {
        return { success:false, message:"No Polar Customer ID found"}
    }

    try{
        const result = await polarClient.subscriptions.list({
            customerId:user?.polarCustomerId
        })

        const subscriptions = result?.result?.items || [];

        //find the most relevant Subscription (active or most recent)
        const activeSub= subscriptions.find((sub:any)=>sub.state === "active")
        const latestSub= subscriptions[0]

        if(activeSub){
            await updateUserTier(user?.id, "PRO","ACTIVE",activeSub?.id)
            return {success:true, status:"ACTIVE"}
        }else if(latestSub){
            //if latest is calcelled or expired
            const status= latestSub.status ==="canceled" ? "CANCELED" :"EXPIRED";

            //Only Downgrade ifwe are sure it's not Active
             if(latestSub?.status !=="active"){
                await updateUserTier(user?.id,"FREE",status,latestSub?.id)
             }

             return {success:true, status}
        }

        return {success:true, status:"NO_SUBSCRIPTION"}

    }catch(error){
            console.error("Fail to sync Subscription with Error: ", error)
            return {success:false, error:"Fail to sync Polar"}
    }
}