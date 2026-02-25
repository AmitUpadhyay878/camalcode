'use server'
import { fetchUserContributions, getGithubAccessToken } from "@/modules/github/lib/github"
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Octokit } from 'octokit'


export async function getDashboardStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            throw new Error('Unauthorized')
        }
        const token = await getGithubAccessToken()
        const oktokit = new Octokit({ auth: token })

        //get user from github
        const { data: user } = await oktokit.rest.users.getAuthenticated()

        //TODO: Total Connected Repos from DB
        const totalRepo = 30; //as of now its a static

        const userName = user?.login

        //get contribution
        const calander = await fetchUserContributions(token,userName )        
        const totalCommites = calander?.totalContributions || 0

        //Counting PR from DB or Github
        const { data: prs } = await oktokit.rest.search.issuesAndPullRequests({
            q: `author:${userName} type:pr`,
            per_page: 1
        })

        const totalPRs = prs.total_count

        //TODO: AI review from Database
        const totalReviews = 44  //as of now its a static

        return { totalCommites, totalPRs, totalReviews, totalRepo }


    } catch (error) {
        console.error("Issue in Fetching Dashboard Stats:", error)
        return {
            totalCommites: 0, totalPRs: 0, totalReviews: 0, totalRepo: 0
        }
    }
}

export async function getMonthlyActivity() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        const token = await getGithubAccessToken()
        const oktokit = new Octokit({ auth: token })

        //get user from github
        const { data: user } = await oktokit.rest.users.getAuthenticated()
        const userName = user?.login

        //get contribution
        const calander = await fetchUserContributions(token, userName)

        if (!calander) {
            return []
        }

        const monthlyData: { [key: string]: { commits: number; prs: number; reviews: number } } = {}

        const monthsNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ]

        // Initaly Getting a 6 months of data
        const now = new Date()
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthKey = monthsNames[date.getMonth()]
            monthlyData[monthKey] = { commits: 0, prs: 0, reviews: 0 }
        }

        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
        calander.weeks.forEach((week: any) => {
            week.contributionDays.forEach((day: any) => {
                const date = new Date(day.date)
                 if (date < sixMonthsAgo) return
                const monthKey = monthsNames[date.getMonth()]
                if (monthlyData[monthKey]) {
                    monthlyData[monthKey].commits += day.contributionCount
                }
            });
        })

        //TODO: Reviews's real data
        const generateSampleReviews = () => {
            const sampleReviews = []
            const now = new Date()

            for (let i = 0; i <= 45; i++) {
                const randomDaysAgo = Math.floor(Math.random() * 180)

                const reviewDate = new Date(now)
                reviewDate.setDate(reviewDate.getDate() - randomDaysAgo)

                sampleReviews.push({
                    createdAt: reviewDate
                })
            }
            return sampleReviews
        }

        const reviews = generateSampleReviews()
        reviews.forEach((review) => {
            const monthKey = monthsNames[review.createdAt.getMonth()]
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].reviews += 1
            }
        })

        const { data: prs } = await oktokit.rest.search.issuesAndPullRequests({
            q: `author:${user?.login} type:pr created:>${sixMonthsAgo.toISOString().split("T")[0]}`,
            per_page: 100
        })

        prs.items.forEach((pr: any) => {
            const date = new Date(pr.created_at)
            const monthKey = monthsNames[date.getMonth()]
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].prs += 1
            }
        })

        return Object.keys(monthlyData).map((name) => (
            {
                name,
                ...monthlyData[name]
            }
        ))
    } catch (error) {
        console.log("Error while fetching Monthly Activity", error)
        return []
    }
}

export async function getContributionStats(){
    try {
         const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        const token = await getGithubAccessToken()
        
        //get the actual github username from Github API
        const octokit = new Octokit({auth:token})
         //get user from github
        const { data: user } = await octokit.rest.users.getAuthenticated()
        let userName = user?.login;
        //get contribution
        const calander = await fetchUserContributions(token,userName)

       if (!calander) {
            return { contribution: [], totalContributions: 0 }
        }

        const contribution = calander.weeks.flatMap((week:any)=>
            week.contributionDays.map((day:any)=>({
                date: day.date,
                count:day.contributionCount,
                level:Math.min(4,Math.floor(day.contributionCount / 3))
            }))
        )

        return {contribution, totalContributions: calander.totalContributions }
    } catch (error) {
        console.log("Error while fetching Contribution Stats:", error)
          return { contribution: [], totalContributions: 0 }
    }
}