'use client'

import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { Address } from '@/payload-types'
import PaystackPop from '@paystack/inline-js'
import { LoadingSpinner } from '@/components/LoadingSpinner'

type Props = {
  customerEmail?: string
  billingAddress?: Partial<Address>
  shippingAddress?: Partial<Address>
  setProcessingPayment: React.Dispatch<React.SetStateAction<boolean>>
  paystackPublicKey: string
  paymentReference: string
  amount: number
}

export const PaystackCheckoutForm: React.FC<Props> = ({
  customerEmail,
  billingAddress,
  shippingAddress,
  setProcessingPayment,
  paystackPublicKey,
  paymentReference,
  amount,
}) => {
  const [error, setError] = React.useState<null | string>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [processingStatus, setProcessingStatus] = React.useState<
    'idle' | 'payment_complete' | 'confirming_order' | 'redirecting'
  >('idle')
  const router = useRouter()
  const { clearCart } = useCart()
  const { confirmOrder } = usePayments()

  const handlePayment = useCallback(() => {
    setIsLoading(true)
    setProcessingPayment(true)
    setError(null)

    try {
      const popup = new PaystackPop()

      popup.newTransaction({
        key: paystackPublicKey,
        email: customerEmail || '',
        amount: Math.round(amount * 100), // Convert to kobo/cents
        reference: paymentReference,

        // Optional: Add metadata
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Email',
              variable_name: 'customer_email',
              value: customerEmail || '',
            },
          ],
        },

        onSuccess: async (transaction) => {
          console.log('Paystack payment successful:', transaction)

          // Immediately show processing state
          setProcessingStatus('payment_complete')

          try {
            setProcessingStatus('confirming_order')

            // Confirm the order with your backend
            const confirmResult = await confirmOrder('paystack', {
              additionalData: {
                reference: transaction.reference,
                ...(customerEmail ? { customerEmail } : {}),
              },
            })

            if (
              confirmResult &&
              typeof confirmResult === 'object' &&
              'orderID' in confirmResult &&
              confirmResult.orderID
            ) {
              setProcessingStatus('redirecting')

              const redirectUrl = `/orders/${confirmResult.orderID}${customerEmail ? `?email=${customerEmail}` : ''}`

              // Clear the cart after successful payment
              clearCart()

              // Use router.push for immediate navigation
              router.push(redirectUrl)
            } else {
              throw new Error('Invalid order confirmation response')
            }
          } catch (err) {
            console.error('Order confirmation error:', err)
            const msg = err instanceof Error ? err.message : 'Something went wrong.'
            setError(`Error while confirming order: ${msg}`)
            setIsLoading(false)
            setProcessingPayment(false)
            setProcessingStatus('idle')
          }
        },

        onCancel: () => {
          console.log('Paystack payment cancelled')
          setError('Payment was cancelled. Please try again.')
          setIsLoading(false)
          setProcessingPayment(false)
          setProcessingStatus('idle')
        },

        onError: (error) => {
          console.error('Paystack payment error:', error)
          setError(`Payment failed: ${error.message || 'Unknown error'}`)
          setIsLoading(false)
          setProcessingPayment(false)
          setProcessingStatus('idle')
        },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(`Error initializing payment: ${msg}`)
      setIsLoading(false)
      setProcessingPayment(false)
      setProcessingStatus('idle')
    }
  }, [
    paystackPublicKey,
    customerEmail,
    amount,
    paymentReference,
    confirmOrder,
    clearCart,
    router,
    setProcessingPayment,
  ])

  // Show processing overlay when payment is being confirmed
  if (processingStatus !== 'idle') {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4 shadow-lg border">
          <div className="flex flex-col items-center text-center gap-6">
            <LoadingSpinner />
            <div>
              <h3 className="font-semibold text-xl mb-2">
                {processingStatus === 'payment_complete' && 'Payment Successful!'}
                {processingStatus === 'confirming_order' && 'Confirming Your Order...'}
                {processingStatus === 'redirecting' && 'Redirecting...'}
              </h3>
              <p className="text-muted-foreground">
                {processingStatus === 'payment_complete' &&
                  'Your payment was successful. Please wait...'}
                {processingStatus === 'confirming_order' &&
                  'We are confirming your order. This will only take a moment...'}
                {processingStatus === 'redirecting' &&
                  'Taking you to your order details...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <Message error={error} />}

      <div className="bg-accent dark:bg-black rounded-lg p-6">
        <h3 className="font-medium text-lg mb-4">Payment Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span>{customerEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
              }).format(amount)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          💳 You&apos;ll be able to pay with card, bank transfer, USSD, or mobile money.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          disabled={isLoading}
          type="button"
          variant="default"
          onClick={handlePayment}
        >
          {isLoading ? 'Processing...' : 'Pay with Paystack'}
        </Button>
      </div>
    </div>
  )
}