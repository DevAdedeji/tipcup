import { adminDb } from '../../utils/admin'

const RESERVED = [
    'admin', 'administrator', 'root', 'sysadmin',
    'support', 'help', 'info', 'contact', 'legal', 'privacy', 'terms',
    'api', 'app', 'dashboard', 'settings', 'auth', 'login', 'signup',
    'logout', 'register', 'profile', 'user', 'users', 'group', 'groups',
    'create', 'edit', 'delete', 'update', 'remove', 'add', 'new',
    'feed', 'explore', 'search', 'notifications', 'messages', 'inbox',
    'tipcup', 'tip', 'cup', 'blog', 'news', 'status', 'bot',
]

export default defineEventHandler(async (event) => {
    const username = String(getQuery(event).username || '').trim().toLowerCase()

    if (username.length < 3) {
        return { available: false, reason: 'At least 3 characters.' }
    }

    if (!/^[a-z0-9-_]+$/.test(username)) {
        return { available: false, reason: 'Letters, numbers, hyphens and underscores only.' }
    }

    if (RESERVED.includes(username)) {
        return { available: false, reason: 'That name is reserved.' }
    }

    const snapshot = await adminDb
        .collection('users')
        .where('username', '==', username)
        .limit(1)
        .get()

    return snapshot.empty
        ? { available: true }
        : { available: false, reason: 'That name is taken.' }
})
