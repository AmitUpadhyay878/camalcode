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
    const query=`
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
    }`


    // interface contributiondata {
    //     user: {
    //         contributionsCollection: {
    //             contributionCalendar: {
    //                 totalContributions: number,
    //                 weeks: {
    //                     contributionDays: {
    //                         contributionCount: number,
    //                         date: string | Date,
    //                         color: string
    //                     }[]
    //                 }[]
    //             }
    //         }
    //     }
    // }

   try{
    const response: any = await octokit.graphql(query, { username })
    return response.user.contributionsCollection.contributionCalendar
   }catch(err){
    console.error('Error fetching contributions:', err)
   }
}