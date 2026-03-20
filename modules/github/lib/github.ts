import { Octokit } from 'octokit'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { headers } from 'next/headers'

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


export const getRepositories = async (page: number = 1, perPage: number = 10) => {
  const token = await getGithubAccessToken()
  const octokit = new Octokit({ auth: token })

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    per_page: perPage,
    page: page
  })

  return data;
}

export const createWebHook = async (owner: string, repo: string) => {

  try {
    const token = await getGithubAccessToken()
    const octokit = new Octokit({ auth: token })

    if (!process.env.NEXT_PUBLIC_APP_BASE_URL) {
      throw new Error('NEXT_PUBLIC_APP_BASE_URL env var is not set')
    }

    const webhookURL = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`


    const { data: hooks } = await octokit.rest.repos.listWebhooks({ owner, repo })
    const existingHook = hooks.find(hook => hook.config.url == webhookURL)

    if (existingHook) {
      return existingHook
    }


    if (!process.env.GITHUB_WEBHOOK_SECRET) {
      throw new Error('GITHUB_WEBHOOK_SECRET env var is not set')
    }

    const { data } = await octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookURL,
        content_type: "json",
        secret: process.env.GITHUB_WEBHOOK_SECRET
      },
      events: [
        "pull_request"
      ]
    })

    return data

  } catch (error) {
    console.error("Something not right for fetching or creating Webhook: ", error)
    return null
  }
}

export const deleteWebHook = async (owner: string, repo: string) => {

  const token = await getGithubAccessToken()
  const octokit = new Octokit({ auth: token })

  const webhookURL = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`

  try {

    const { data: hooks } = await octokit.rest.repos.listWebhooks({ owner, repo })

    const existingHook = hooks.find(hook => hook.config.url == webhookURL)

    if (!existingHook) {
      console.log("No existing webhook found for deletion")
      return false
    }
    await octokit.rest.repos.deleteWebhook({
      owner,
      repo,
      hook_id: existingHook.id
    })
    return true

  } catch (error) {
    console.log("Something not right for deleting Webhook: ", error)
    return false
  }

}

export async function getRepoFilesContent(owner: string, repo: string, token: string, path: string = ""): Promise<{ path: string, content: string }[]> {
  const octokit = new Octokit({ auth: token })

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path
    })

    if (!Array.isArray(data)) {
      if (data.type === "file" && data.content) {
        return [{
          path: data.path,
          content: Buffer.from(data.content, 'base64').toString('utf-8')
        }]
      }
      return []
    }

    let files: { path: string, content: string }[] = []


    const pLimit = require('p-limit');
    const limit = pLimit(10);

    // for(const item of data){
    //   if(item.type === "file"){
    //     const {data: fileData} = await octokit.rest.repos.getContent({
    //       owner,
    //       repo,
    //       path: item.path
    //     })

    //     if(!Array.isArray(fileData) && fileData.type === "file" && fileData.content){

    //       if(!item.path.match(/\.(png|jpg|jpeg|gif|bmp|svg|ico|zip|pdf|tar|gz)$/i)){ 

    //         files.push({
    //           path: fileData.path,
    //           content: Buffer.from(fileData.content, 'base64').toString('utf-8')
    //         })
    //       }
    //     }

    //   }

    //    else if(item.type === "dir"){
    //       const subFiles = await getRepoFilesContent(owner, repo, token, item?.path)
    //       files = files.concat(subFiles)
    //     }
    // }


    const filePromises = data.map(item => limit(async () => {
      if (item.type === "file") {
        if (item.path.match(/\.(png|jpg|jpeg|gif|bmp|svg|ico|zip|pdf|tar|gz|woff|woff2|ttf|eot|mp4|mov|avi|exe|dll|so|dylib)$/i)) {
          return [];
        }
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: item.path
        });
        if (!Array.isArray(fileData) && fileData.type === "file" && fileData.content) {
          return [{
            path: fileData.path,
            content: Buffer.from(fileData.content, 'base64').toString('utf-8')
          }];
        }
      } else if (item.type === "dir") {
        return getRepoFilesContent(owner, repo, token, item.path);
      }
      return [];
    }));
    const results = await Promise.all(filePromises);
    files = results.flat();


    return files

  } catch (error) {
    console.error(`Error fetching content for path ${path}:`, error)
    return []
  }
}


export async function getPullRequestDiff(token: string, owner: string, repo: string, prNumber: number) {
  const octokit = new Octokit({ auth: token })

  try {
    const { data:pr } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    })
    
    const {data:diff} = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType:{
        format:"diff"
      }
    })
    
    return {
      diff: diff as unknown as string,
      title: pr.title,
      description: pr.body || "",
    }

  } catch (error) {
    console.error(`Error fetching pull request diff for PR ${prNumber}:`, error)
    return null
  }
}


export async function postReviewComment(token: string, owner: string, repo: string, prNumber: number, review: string) {
  const octokit = new Octokit({ auth: token })

  try {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: `## AI Code Review\n\n${review}\n\n---\n*Powered by camalcode*`
    })
  } catch (error) {
    console.error(`Error posting review comment for PR ${prNumber}:`, error)
  }
}