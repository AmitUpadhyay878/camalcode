'use server'

import { inngest } from "@/inngest/client"
import prisma from "@/lib/db"
import { getPullRequestDiff } from "@/modules/github/lib/github"


export async function reviewPullRequest(
    owner:string,
    repo:string,
    prNumber:number
){
 
    try{
       const repository = await prisma.repository.findFirst({
        where:{
            owner,
            name:repo
        },
        include:{
            user:{
                include:{
                    accounts:{
                        where:{
                            providerId:"github"
                        }
                    }
                }
            }
        }
     })

        if(!repository){    
            throw new Error(`Repository not found in database: ${owner}/${repo}`)
        }

        const githubAccount  = repository.user.accounts[0]

        if(!githubAccount?.accessToken){
            throw new Error(`GitHub account not found for user: ${repository.userId}`)
        }

        const token = githubAccount.accessToken;

        const prData = await getPullRequestDiff(token, owner, repo, prNumber) 


        await inngest.send({
            name:"pull_request.review",
            data:{
                owner,
                repo,
                prNumber,
                userId: repository.userId
             }
        })

        return {
            success:true,
            message:`Review process started for ${owner}/${repo} PR #${prNumber} - ${prData?.title}`
        }

 }catch(error){
    try{
        const repository = await prisma.repository.findFirst({
            where:{
                owner, 
                name:repo
            }
        })

        if(repository){
                await prisma.review.create({
                data:{
                    repositoryId:repository.id,
                    prNumber,
                    prTitle: "Failed to fetch PR",
                    prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                    review:`Error:${error instanceof Error ? error.message : "Unknown error"}`,
                    status: "failed"
                }
            })

        }

    }catch(dberror){
        console.error("Error while logging review failure to database:", dberror)
     
    }
}
}