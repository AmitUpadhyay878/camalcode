'use server'
import prisma from '@/lib/db'
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import {createWebHook, getRepositories} from '@/modules/github/lib/github'


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

            //TODO: check user is free and connect more repos

            
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
            }

            //TODO: Increament Repositiory Count for usage tracking


            //TODO: trigger Repository indexing for RAG


            return webhook

        } catch (error) {
            console.log("Error while connecting Repository", error) 
        }
}