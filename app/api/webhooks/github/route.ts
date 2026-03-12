import { timingSafeEqual, createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text()
        const signature = request.headers.get("x-hub-signature-256")
        const secret = process.env.GITHUB_WEBHOOK_SECRET

        if (!secret) {
            console.error("GITHUB_WEBHOOK_SECRET is not configured")
            return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
        }

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 })
        }

        const hmac = createHmac('sha256', secret)
        const digest = `sha256=${hmac.update(rawBody).digest('hex')}`

        const signatureBuffer = Buffer.from(signature)
        const digestBuffer = Buffer.from(digest)

        if (signatureBuffer.length !== digestBuffer.length || !timingSafeEqual(signatureBuffer, digestBuffer)
        ) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }

        const body = JSON.parse(rawBody)
        const event = request.headers.get("X-GitHub-Event")

        if (event === "ping") {
            return NextResponse.json({ message: "pong" }, { status: 200 })
        }

       // return NextResponse.json({ message: "Event received" }, { status: 200 })

       if (event !== "pull_request") {
        return NextResponse.json({ error: "Unhandled event type" }, { status: 400 })
       }

       return NextResponse.json(
        { error: "pull_request handling is not implemented yet" },
        { status: 501 },
       )

    } catch (error) {
        console.error("Error while handling github webhook", error)
        return NextResponse.json({ error: "Failed to handle webhook" }, { status: 500 })
    }
}