import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins"
import type { auth } from "./auth"

export const authClient =  createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : undefined),
    plugins: [
        inferAdditionalFields<typeof auth>(),
        twoFactorClient()
    ]
})
