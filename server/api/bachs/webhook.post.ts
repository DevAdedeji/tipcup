import { verifyWebhookSignature, type BachsWebhookEvent } from '../../utils/bachs'
import { recordSuccessfulCollection, recordPayoutResult, claimWebhookEvent } from '../../utils/payments'

export default defineEventHandler(async (event) => {
    // Must be the raw bytes: re-serialising parsed JSON breaks the signature.
    const rawBody = await readRawBody(event, 'utf8')

    if (!rawBody) {
        throw createError({ statusCode: 400, statusMessage: 'Empty request body' })
    }

    const signature = getHeader(event, 'x-bachs-signature')
    const timestamp = getHeader(event, 'x-bachs-timestamp')

    if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
    }

    let payload: BachsWebhookEvent
    try {
        payload = JSON.parse(rawBody)
    } catch {
        throw createError({ statusCode: 400, statusMessage: 'Malformed JSON payload' })
    }

    const { id, type, data } = payload

    if (id && !(await claimWebhookEvent(id))) {
        return { received: true, deduplicated: true }
    }

    try {
        switch (type) {
            case 'collection.succeeded': {
                await recordSuccessfulCollection(data)
                break
            }

            case 'payout.paid': {
                await recordPayoutResult(data, 'completed')
                break
            }

            case 'payout.failed': {
                await recordPayoutResult(data, 'failed')
                break
            }

            default:
                break
        }
    } catch (error: any) {
        console.error(`Failed handling Bachs event ${type} (${id}):`, error?.message || error)
        throw createError({ statusCode: 500, statusMessage: 'Event processing failed' })
    }

    return { received: true }
})
