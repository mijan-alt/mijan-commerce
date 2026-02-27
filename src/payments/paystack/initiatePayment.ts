import { Cart } from '@/payload-types'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import axios from 'axios'

export const initiatePayment = (props: {
  secretKey: string
  publicKey: string
  baseUrl?: string
  paystackUrl?: string
}): NonNullable<PaymentAdapter>['initiatePayment'] => {
  return async ({ data, req, transactionsSlug, customersSlug }) => {
    console.log('data', data)
    const payload = req.payload
    const { secretKey, publicKey, baseUrl, paystackUrl } = props
    const customerEmail = data.customerEmail
    const currency = data.currency
    const cart = data.cart as Cart
    const amount = cart.subtotal
    const billingAddressFromData = data.billingAddress
    const shippingAddressFromData = data.shippingAddress

    console.log('amount:', amount)

    // Validate required fields
    if (!currency) {
      throw new Error('Currency is required.')
    }

    if (currency !== 'NGN') {
      throw new Error('Paystack only supports NGN currency.')
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty or not provided.')
    }

    if (!customerEmail || typeof customerEmail !== 'string') {
      throw new Error('A valid customer email is required to make a purchase.')
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error('A valid amount is required to initiate a payment.')
    }

    try {
      // Calculate amount in kobo (smallest currency unit for NGN)
      const amountInKobo = Math.round(amount * 100)

      // Flatten cart items for metadata
      const flattenedCart = cart.items.map((item: any) => {
        const productID = typeof item.product === 'object' ? item.product.id : item.product
        const variantID = item.variant
          ? typeof item.variant === 'object'
            ? item.variant.id
            : item.variant
          : undefined

        return {
          product: productID,
          quantity: item.quantity,
          ...(variantID
            ? {
                variant: variantID,
              }
            : {}),
        }
      })

      // Prepare addresses for metadata
      const shippingAddress = shippingAddressFromData || billingAddressFromData
      const shippingAddressAsString = JSON.stringify(shippingAddress)
      const billingAddressAsString = JSON.stringify(billingAddressFromData)

      // Initialize Paystack transaction
      const response = await axios.post(
        `${paystackUrl}/transaction/initialize`,
        {
          email: customerEmail,
          amount: amountInKobo,
          currency: 'NGN',
          // ❌ REMOVED callback_url - not needed for inline mode
          metadata: {
            cartID: cart.id,
            cartItemsSnapshot: JSON.stringify(flattenedCart),
            shippingAddress: shippingAddressAsString,
            billingAddress: billingAddressAsString,
            // You can keep cancel_action for reference, but it won't be used
          },
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      )

      const paystackData = response.data.data

      if (!paystackData.reference) {
        throw new Error('Failed to initialize Paystack transaction')
      }

      // Create a transaction record in the database
      const transaction = await payload.create({
        collection: transactionsSlug as any,
        data: {
          ...(req.user
            ? {
                customer: req.user.id,
              }
            : {
                customerEmail,
              }),
          amount: amount,
          billingAddress: billingAddressFromData,
          shippingAddress: shippingAddress,
          cart: cart.id,
          currency: currency.toUpperCase(),
          items: flattenedCart,
          paymentMethod: 'paystack',
          status: 'pending',
          paystack: {
            reference: paystackData.reference,
            transactionId: paystackData.id,
            accessCode: paystackData.access_code,
          },
        },
      })

      // Return data for inline checkout
      return {
        // ✅ Essential data for Paystack inline popup
        publicKey: publicKey,
        email: customerEmail,
        amount: amountInKobo,
        reference: paystackData.reference,
        accessCode: paystackData.access_code,

        // ✅ Keep authorization URL as fallback (won't be used in inline mode)
        authorizationUrl: paystackData.authorization_url,

        // ✅ Transaction tracking
        transactionId: transaction.id,

        // ✅ Additional metadata for the popup
        metadata: {
          cartID: cart.id,
          custom_fields: [
            {
              display_name: 'Cart ID',
              variable_name: 'cart_id',
              value: cart.id,
            },
          ],
        },

        message: 'Payment initiated successfully',
        mode: 'inline', // ✅ Indicates inline mode
      }
    } catch (error: any) {
      payload.logger.error(error, 'Error initiating payment with Paystack')

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Unknown error initiating payment with Paystack',
      )
    }
  }
}
