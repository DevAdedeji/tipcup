import { getAuth } from 'firebase-admin/auth'
import type { H3Event } from 'h3'
import './admin'

export interface AuthenticatedUser {
    uid: string
    email: string | null
}

// Money endpoints must identify the caller from their token, never from a
// user id in the request body.
export const requireUser = async (event: H3Event): Promise<AuthenticatedUser> => {
    const header = getHeader(event, 'authorization') || ''
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''

    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    try {
        const decoded = await getAuth().verifyIdToken(token)
        return { uid: decoded.uid, email: decoded.email ?? null }
    } catch {
        throw createError({ statusCode: 401, statusMessage: 'Invalid or expired session' })
    }
}
