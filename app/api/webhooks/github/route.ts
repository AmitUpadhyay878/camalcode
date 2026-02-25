import {NextRequest,NextResponse} from 'next/server'

export async function POST(request:NextRequest){
    try {
        const body = await request.json()

        const event = request.headers.get("X-GitHub-Event")

        if(event === "ping"){
            return NextResponse.json({message:"pong"},{status:200})
        }

        //ToDO: Handle other events like push, pull_request etc and trigger indexing for RAG

        return NextResponse.json({message:"Event received"},{status:200})
    
    }catch(error){
            console.log("Error while handling github webhook", error)
            return NextResponse.json({error:"Failed to handle webhook"}, {status:500})  
        }
        }