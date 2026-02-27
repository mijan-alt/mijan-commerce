// payments/paystack/webhooks.ts
import crypto from 'crypto'
import type { Endpoint } from 'payload'

export const webhooksEndpoint = (props: {
  secretKey: string
  baseUrl?: string
  webhooks?: {
    [eventType: string]: (args: { event: any; req: any }) => Promise<void> | void
  }
}): Endpoint => {
  const { secretKey, webhooks } = props

  return {
    method: 'post',
    path: '/webhooks',
    handler: async (req) => {
      let returnStatus = 200

      try {
        const body = await req.text!()
        const paystackSignature = req.headers.get('x-paystack-signature')

        if (!paystackSignature) {
          req.payload.logger.error('Missing Paystack signature header')
          return Response.json({ received: false, error: 'Missing signature' }, { status: 401 })
        }

        // Verify webhook signature
        const hash = crypto.createHmac('sha512', secretKey).update(body).digest('hex')

        if (hash !== paystackSignature) {
          req.payload.logger.error('Invalid Paystack webhook signature')
          return Response.json({ received: false, error: 'Invalid signature' }, { status: 401 })
        }

        // Signature is valid, process the event
        const event = JSON.parse(body)

        if (typeof webhooks === 'object' && event) {
          const webhookEventHandler = webhooks[event.event]

          if (typeof webhookEventHandler === 'function') {
            await webhookEventHandler({
              event,
              req,
            })
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : JSON.stringify(err)
        req.payload.logger.error(`Error processing Paystack webhook: ${msg}`)
        returnStatus = 400
      }

      return Response.json({ received: true }, { status: returnStatus })
    },
  }
}
