import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { polarClient } from "@/modules/payment/config/polar";
import { updatePolarCustomerId, updateUserTier } from "@/modules/payment/lib/subscription";
import { sub } from "date-fns";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders:{
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            // scope:["repo"]
            scope:["read:user", "user:email", "repo", "read:org"]
    }, 
},
trustedOrigins:["http://localhost:3000","https://80ad-2409-40c1-2035-3cf7-17a-f759-4672-4594.ngrok-free.app"],
plugins:[
    polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "430a6c3d-edc4-41c0-a183-ad90a3e24cf4",
                            slug: "pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/camalcode
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL || "/subscription?success=true",
                    authenticatedUsersOnly: true
                }),
                portal({
                    returnUrl:process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000/dashboard"
                }),
                usage(),
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SECRET!,
                    onSubscriptionActive:async (payload)=>{
                        const customerId = payload.data.customerId;
                        const user = await prisma.user.findUnique({
                            where: {
                                polarCustomerId: customerId
                            }
                        });

                        if(user){
                            await updateUserTier(user?.id, "PRO","ACTIVE",payload?.data?.id);
                        }
                    },
                    onSubscriptionCanceled:async (payload)=>{

                         const customerId = payload.data.customerId;
                        const user = await prisma.user.findUnique({
                            where: {
                                polarCustomerId: customerId
                            }
                        });

                        if(user){
                            await updateUserTier(user?.id, user?.subscriptionTier as any, "CANCELED");
                        }

                    },
                    onSubscriptionRevoked:async (payload)=>{
                        const customerId = payload.data.customerId;
                        const user = await prisma.user.findUnique({
                            where: {
                                polarCustomerId: customerId
                            }
                        });

                        if(user){
                            await updateUserTier(user?.id, "FREE", "EXPIRED");
                        }
                    },
                    onOrderPaid:async ()=>{

                    },
                    onCustomerCreated:async (payload)=>{
                      const user = await prisma.user.findUnique({
                        where:{
                            email:payload.data.email
                        }
                      })

                      if(user){
                        await updatePolarCustomerId(user?.id, payload?.data?.id);
                      }
                    }
                })

            ],  
        })
]
});