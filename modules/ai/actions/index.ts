'use server'

import { inngest } from "@/inngest/client"
import prisma from "@/lib/db"
import { getPullRequestDiff } from "@/modules/github/lib/github"

import { canCreateReview, incrementReviewCount } from "@/modules/payment/lib/subscription"


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

        const canReview = await canCreateReview(repository?.user?.id, repository?.id)   

        if(!canReview){
            throw new Error(`User cannot create a review for this repository: ${owner}/${repo} , Please upgrade to pro for unlimited review`)
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


        await incrementReviewCount(repository?.user?.id, repository?.id)

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