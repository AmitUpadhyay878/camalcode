'use server'
import prisma from '@/lib/db'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {createWebHook, getRepositories} from '@/modules/github/lib/github'
import { inngest } from '@/inngest/client'
import { canConnectRepository, decrementRepositoryCount, incrementRepositoryCount } from '@/modules/payment/lib/subscription'


export const fetchRepositories =async (page:number =1, perPage:number=10)=>{
        try {
                const session = await auth.api.getSession({
                            headers: await headers()
                        })
                
                        if (!session?.user) {
                            throw new Error('Unauthorized')
                        }
                
                        const githubRepos = await getRepositories(page, perPage)
                       
                        const dbRepos = await prisma.repository.findMany({
                            where:{
                                userId:session.user.id
                            },
                            select: { githubId: true }
                        })

                        const connectedRepoIds = new Set(dbRepos?.map((repo)=>Number(repo.githubId)))
                        return githubRepos.map((repo:any)=>({
                            ...repo,
                            isConnected:connectedRepoIds.has(Number(repo?.id))
                        }))

        } catch (error) {
        console.log("Error while fetching Connected Repositories", error)
        return []
        }
}

export const connectRepository =async(owner:string,repo:string,githubId:number)=>{
        try {
             const session = await auth.api.getSession({
                            headers: await headers()
                        })
                
                        if (!session?.user) {
                            throw new Error('Unauthorized')
                        }

            //check if user can connect more repos or not.

                        const canConnect = await canConnectRepository(session?.user?.id)

                        if(!canConnect){
                            //if limit reach
                            throw new Error(`Repository limit reached, Please upgrade to PRO for unlimited repositories.`)   
                        }
                        

            
            const webhook = await createWebHook(owner, repo)
            if(webhook){
                await prisma.repository.create({data:{
                    githubId:BigInt(githubId),
                    name: repo,
                    owner,
                    fullName:`${owner}/${repo}`,
                    url:`https://github.com/${owner}/${repo}`,
                    userId:session?.user?.id
                }})
          

            //Increament Repositiory Count for usage tracking
            
            await incrementRepositoryCount(session?.user?.id)

           //Inngest background Event for Repository Connected
            try{
                    await inngest.send({
                        name:"repository.connected",
                        data:{
                            owner,
                            repo,
                            userId: session?.user?.id
                        }
                    })

            }catch(error){
                    console.error("Failed to send repository.connected event to Inngest", error)
            }

  }
            return webhook

        } catch (error) {
                console.error("Error while connecting Repository", error)
            throw error
        }
}