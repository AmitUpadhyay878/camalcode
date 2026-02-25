import {Octokit} from 'octokit'
import {auth} from '@/lib/auth'
import prisma from '@/lib/db'
import {headers} from 'next/headers'

//getting a github access token for the user
export const getGithubAccessToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    throw new Error('Unauthorized')
  } 
    
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: 'github',
    },
  })

    if (!account?.accessToken) {
        throw new Error('GitHub access token not found')
    }

    return account.accessToken
}   


//fetching the user's contributions from github using the access token
export async function fetchUserContributions(token: string, username: string) {
  const octokit = new Octokit({ auth: token })

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `

  try {
    const response: any = await octokit.graphql(query, { username })

    return response?.user?.contributionsCollection?.contributionCalendar ?? null
  } catch (err) {
    console.error('Error fetching contributions:', err)
    return null
  }
}


export const getRepositories = async (page:number =1, perPage:number=10)=>{
   const token = await getGithubAccessToken()
    const octokit = new Octokit({ auth: token })

    const {data} = await octokit.rest.repos.listForAuthenticatedUser({
      sort:"updated",
      direction:"desc",
      visibility:"all",
      per_page:perPage,
      page:page
    })

    return data;
}

export const createWebHook = async(owner:string, repo:string)=>{

  try{
     const token = await getGithubAccessToken()
    const octokit = new Octokit({ auth: token })

    const  webhookURL =  `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`

    const {data:hooks}  = await  octokit.rest.repos.listWebhooks({owner,repo})
    const existingHook = hooks.find(hook=>hook.config.url == webhookURL)

      if(existingHook){
        return existingHook
      }
      const {data} = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config:{
          url:webhookURL,
          content_type:"json"
        },
        events:[
          "pull_request"
        ]
      })

      return data

  }catch(error){
      console.log("Something not right for fetching or creating Webhook: ", error)
  }
}