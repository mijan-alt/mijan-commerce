import { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import axios from 'axios'

export const confirmOrder = (props: {
  secretKey: string
  baseUrl?: string
  paystackUrl?: string
}): NonNullable<PaymentAdapter>['confirmOrder'] => {
  return async ({ data, ordersSlug = 'orders', req, transactionsSlug = 'transactions' }) => {
    const payload = req.payload
    const { secretKey, baseUrl, paystackUrl } = props

    const customerEmail = data.customerEmail
    const reference = data.reference

    if (!reference) {
      throw new Error('Payment reference is required')
    }

    try {
      // Verify the transaction with Paystack
      const verifyResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      })

      const paystackTransaction = verifyResponse.data.data

      // Check payment status
      if (paystackTransaction.status !== 'success') {
        throw new Error(`Payment not successful: ${paystackTransaction.status}`)
      }

      // Find existing transaction by reference
      const transactionsResults = await payload.find({
        collection: 'transactions',
        where: {
          'paystack.reference': {
            equals: reference,
          },
        },
      })

      const transaction = transactionsResults.docs[0]

      if (!transactionsResults.totalDocs || !transaction) {
        throw new Error('No transaction found for the provided reference')
      }

      // Extract metadata from Paystack transaction
      const cartID = paystackTransaction.metadata?.cartID
      const cartItemsSnapshot = paystackTransaction.metadata?.cartItemsSnapshot
        ? JSON.parse(paystackTransaction.metadata.cartItemsSnapshot)
        : undefined
      const shippingAddress = paystackTransaction.metadata?.shippingAddress
        ? JSON.parse(paystackTransaction.metadata.shippingAddress)
        : undefined
      const billingAddress = paystackTransaction.metadata?.billingAddress
        ? JSON.parse(paystackTransaction.metadata.billingAddress)
        : undefined

      if (!cartID) {
        throw new Error('Cart ID not found in the Paystack transaction metadata')
      }

      if (!cartItemsSnapshot || !Array.isArray(cartItemsSnapshot)) {
        throw new Error(
          'Cart items snapshot not found or invalid in the Paystack transaction metadata',
        )
      }

      // Create the order in the database
      const order = await payload.create({
        collection: 'orders',
        data: {
          amount: paystackTransaction.amount / 100, // Convert from kobo to naira
          currency: paystackTransaction.currency.toUpperCase(),
          ...(req.user
            ? {
                customer: req.user.id,
              }
            : {
                customerEmail,
              }),
          items: cartItemsSnapshot,
          shippingAddress: shippingAddress || billingAddress,
          status: 'processing',
          transactions: [transaction.id],
        },
      })

      const timestamp = new Date().toISOString()

      // Update the cart to mark it as purchased
      await payload.update({
        id: cartID,
        collection: 'carts',
        data: {
          purchasedAt: timestamp,
        },
      })

      // Update the transaction with order info and mark as succeeded
      await payload.update({
        id: transaction.id,
        collection: 'transactions',
        data: {
          order: order.id,
          status: 'succeeded',
        },
      })

      return {
        message: 'Order confirmed successfully',
        orderID: order.id,
        transactionID: transaction.id,
      }
    } catch (error: any) {
      payload.logger.error(error, 'Error confirming order with Paystack')

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Unknown error confirming order with Paystack',
      )
    }
  }
}
