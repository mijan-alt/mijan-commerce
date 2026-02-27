'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { FormItem } from '@/components/forms/FormItem'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Checkbox } from '@/components/ui/checkbox'
import { Address } from '@/payload-types'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from 'sonner'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const { initiatePayment, confirmOrder, paymentMethods } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>('paystack')
  const [processingStatus, setProcessingStatus] = useState<
    'idle' | 'payment_complete' | 'confirming_order' | 'redirecting'
  >('idle')

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const canGoToPayment = Boolean(
    (email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress),
  )

  useEffect(() => {
    if (!billingAddress && addresses && addresses.length > 0) {
      setBillingAddress(addresses[0])
    }
  }, [addresses, billingAddress])

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedProvider) {
      setSelectedProvider(paymentMethods[0].name)
    }
  }, [paymentMethods, selectedProvider])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const handlePayment = useCallback(async () => {
    if (!canGoToPayment) {
      toast.error('Please complete all required fields')
      return
    }

    setError(null)
    setProcessingPayment(true)

    try {
      const paymentData = (await initiatePayment(selectedProvider, {
        additionalData: {
          ...(email ? { customerEmail: email } : {}),
          billingAddress,
          shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
        },
      })) as Record<string, unknown>

      if (selectedProvider === 'paystack') {
        if (!paymentData?.reference) {
          throw new Error('Failed to initialize payment')
        }

        const reference = paymentData.reference as string
        const customerEmail = email || user?.email || ''

        const { default: PaystackPop } = await import('@paystack/inline-js')
        const popup = new PaystackPop()

        popup.newTransaction({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          email: customerEmail,
          amount: Math.round((cart?.subtotal || 0) * 100),
          reference,
          metadata: {
            custom_fields: [
              {
                display_name: 'Customer Email',
                variable_name: 'customer_email',
                value: customerEmail,
              },
            ],
          },

          onSuccess: async (transaction) => {
            setProcessingStatus('payment_complete')
            try {
              setProcessingStatus('confirming_order')
              const confirmResult = await confirmOrder('paystack', {
                additionalData: {
                  reference: transaction.reference,
                  ...(email ? { customerEmail: email } : {}),
                },
              })

              if (
                confirmResult &&
                typeof confirmResult === 'object' &&
                'orderID' in confirmResult &&
                confirmResult.orderID
              ) {
                setProcessingStatus('redirecting')
                clearCart()
                const redirectUrl = `/orders/${confirmResult.orderID}${email ? `?email=${email}` : ''}`
                router.push(redirectUrl)
              } else {
                throw new Error('Invalid order confirmation response')
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Something went wrong.'
              setError(`Error confirming order: ${msg}`)
              toast.error(`Error confirming order: ${msg}`)
              setProcessingPayment(false)
              setProcessingStatus('idle')
            }
          },

          onCancel: () => {
            setError('Payment was cancelled. Please try again.')
            toast.error('Payment was cancelled')
            setProcessingPayment(false)
            setProcessingStatus('idle')
          },

          onError: (error) => {
            setError(`Payment failed: ${error.message || 'Unknown error'}`)
            toast.error(`Payment failed: ${error.message || 'Unknown error'}`)
            setProcessingPayment(false)
            setProcessingStatus('idle')
          },
        })
      }
    } catch (err) {
      const errorData = err instanceof Error ? JSON.parse(err.message) : {}
      let errorMessage = 'An error occurred while initiating payment.'
      if (errorData?.cause?.code === 'OutOfStock') {
        errorMessage = 'One or more items in your cart are out of stock.'
      }
      setError(errorMessage)
      toast.error(errorMessage)
      setProcessingPayment(false)
      setProcessingStatus('idle')
    }
  }, [
    canGoToPayment,
    email,
    user,
    billingAddress,
    shippingAddress,
    billingAddressSameAsShipping,
    cart,
    selectedProvider,
    initiatePayment,
    confirmOrder,
    clearCart,
    router,
  ])

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
                {processingStatus === 'redirecting' && 'Taking you to your order details...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>Your cart is empty.</p>
        <Link href="/shop">Continue shopping?</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        {/* Contact Section */}
        <div>
          <h2 className="font-medium text-3xl mb-4">Contact</h2>
          {!user && (
            <div className="bg-accent dark:bg-black rounded-lg p-4 w-full mb-4">
              <div className="prose dark:prose-invert">
                <Button asChild className="no-underline text-inherit" variant="outline">
                  <Link href="/login">Log in</Link>
                </Button>
                <p className="mt-0">
                  <span className="mx-2">or</span>
                  <Link href="/create-account">create an account</Link>
                </p>
              </div>
            </div>
          )}

          {user ? (
            <div className="bg-accent dark:bg-card rounded-lg p-4">
              <p>{user.email}</p>
              <p>
                Not you?{' '}
                <Link className="underline" href="/logout">
                  Log out
                </Link>
              </p>
            </div>
          ) : (
            <div className="bg-accent dark:bg-black rounded-lg p-4">
              <p className="mb-4">Enter your email to checkout as a guest.</p>
              <FormItem className="mb-6">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  disabled={!emailEditable}
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                />
              </FormItem>
              <Button
                disabled={!email || !emailEditable}
                onClick={(e) => {
                  e.preventDefault()
                  setEmailEditable(false)
                }}
                variant="default"
              >
                Continue as guest
              </Button>
            </div>
          )}
        </div>

        {/* Address Section */}
        <div>
          <h2 className="font-medium text-3xl mb-4">Address</h2>
          {billingAddress ? (
            <div className="mb-4">
              <AddressItem
                actions={
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      setBillingAddress(undefined)
                    }}
                  >
                    Remove
                  </Button>
                }
                address={billingAddress}
              />
            </div>
          ) : user ? (
            <CheckoutAddresses heading="Billing address" setAddress={setBillingAddress} />
          ) : (
            <CreateAddressModal
              disabled={!email || emailEditable}
              callback={(address) => {
                setBillingAddress(address)
              }}
              skipSubmission={true}
            />
          )}

          <div className="flex gap-4 items-center my-4">
            <Checkbox
              id="shippingTheSameAsBilling"
              checked={billingAddressSameAsShipping}
              disabled={!user && (!email || emailEditable)}
              onCheckedChange={(state) => {
                setBillingAddressSameAsShipping(state as boolean)
              }}
            />
            <Label htmlFor="shippingTheSameAsBilling">Shipping is the same as billing</Label>
          </div>

          {!billingAddressSameAsShipping && (
            <>
              {shippingAddress ? (
                <div>
                  <AddressItem
                    actions={
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          setShippingAddress(undefined)
                        }}
                      >
                        Remove
                      </Button>
                    }
                    address={shippingAddress}
                  />
                </div>
              ) : user ? (
                <CheckoutAddresses
                  heading="Shipping address"
                  description="Please select a shipping address."
                  setAddress={setShippingAddress}
                />
              ) : (
                <CreateAddressModal
                  callback={(address) => {
                    setShippingAddress(address)
                  }}
                  disabled={!email || emailEditable}
                  skipSubmission={true}
                />
              )}
            </>
          )}
        </div>

        {error && (
          <div className="my-4">
            <Message error={error} />
            <Button
              onClick={(e) => {
                e.preventDefault()
                setError(null)
              }}
              variant="outline"
              className="mt-4"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Payment Section */}
        <div className="bg-primary/5 rounded-lg p-6">
          <h3 className="font-medium text-xl mb-4">Payment Method</h3>

          {paymentMethods.length > 1 && (
            <div className="mb-6">
              <RadioGroup
                value={selectedProvider}
                onValueChange={setSelectedProvider}
                disabled={isProcessingPayment}
              >
                {paymentMethods.map((method) => (
                  <div key={method.name} className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value={method.name} id={method.name} />
                    <Label htmlFor={method.name} className="cursor-pointer">
                      {method.label || method.name}
                      {method.name === 'paystack' && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          (Cards, Bank Transfer, Mobile Money)
                        </span>
                      )}
                      {method.name === 'stripe' && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          (International Cards, Apple Pay, Google Pay)
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="mb-6 p-4 bg-background/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              {selectedProvider === 'paystack' && (
                <>
                  💳 Secure payment via Paystack. Supports cards, bank transfers, and mobile money
                  for African customers.
                </>
              )}
              {selectedProvider === 'stripe' && (
                <>
                  💳 Secure payment via Stripe. Accepts international cards, Apple Pay, and Google
                  Pay.
                </>
              )}
            </p>
          </div>

          <Button
            size="lg"
            disabled={!canGoToPayment || isProcessingPayment}
            onClick={handlePayment}
            className="w-full"
          >
            {isProcessingPayment ? (
              'Processing...'
            ) : (
              <>
                Pay
                {cart?.subtotal && (
                  <span className="ml-2">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(
                      cart.subtotal,
                    )}
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Cart Summary */}
      {!cartIsEmpty && (
        <div className="basis-full lg:basis-1/3 lg:pl-8 p-8 border-none bg-primary/5 flex flex-col gap-8 rounded-lg h-fit sticky top-24">
          <h2 className="text-3xl font-medium">Your cart</h2>
          {cart?.items?.map((item, index) => {
            if (typeof item.product !== 'object' || !item.product) return null

            const { product, quantity, variant } = item
            const { meta, title, gallery } = product
            const itemData = item as any

            if (!quantity) return null

            const isVariant = Boolean(variant) && typeof variant === 'object'

            // Read effective price from itemData — baked in by beforeChange hook
            const isOnSale = !isVariant && Boolean(itemData.onSale && itemData.salePriceInNGN)
            const regularPrice: number = itemData.regularPriceInNGN ?? product.priceInNGN
            let price: number = isOnSale
              ? itemData.salePriceInNGN
              : (itemData.regularPriceInNGN ?? product.priceInNGN)

            let image = gallery?.[0]?.image || meta?.image

            if (isVariant && typeof variant === 'object') {
              // Variant price also comes from hook-resolved item.priceInNGN
              price = itemData.priceInNGN ?? variant?.priceInNGN

              const imageVariant = product.gallery?.find((galleryItem: any) => {
                if (!galleryItem.variantOption) return false
                const variantOptionID =
                  typeof galleryItem.variantOption === 'object'
                    ? galleryItem.variantOption.id
                    : galleryItem.variantOption

                const hasMatch = (variant as any)?.options?.some((option: any) => {
                  if (typeof option === 'object') return option.id === variantOptionID
                  return option === variantOptionID
                })

                return hasMatch
              })

              if (imageVariant && typeof imageVariant.image !== 'string') {
                image = imageVariant.image
              }
            }

            return (
              <div className="flex items-start gap-4" key={index}>
                <div className="flex items-stretch justify-stretch h-20 w-20 p-2 rounded-lg border">
                  <div className="relative w-full h-full">
                    {image && typeof image !== 'string' && (
                      <Media className="" fill imgClassName="rounded-lg" resource={image} />
                    )}
                  </div>
                </div>
                <div className="flex grow justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-lg">{title}</p>
                    {variant && typeof variant === 'object' && (
                      <p className="text-sm font-mono text-primary/50 tracking-widest">
                        {(variant as any).options
                          ?.map((option: any) => {
                            if (typeof option === 'object') return option.label
                            return null
                          })
                          .join(', ')}
                      </p>
                    )}
                    <div>x{quantity}</div>
                  </div>

                  {/* Price display with sale support */}
                  <div className="flex flex-col items-end gap-0.5">
                    {isOnSale ? (
                      <>
                        <Price amount={price} className="text-sm font-semibold text-red-600" />
                        <Price
                          amount={regularPrice}
                          className="text-xs text-muted-foreground line-through"
                        />
                      </>
                    ) : (
                      typeof price === 'number' && <Price amount={price} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          <hr />
          <div className="flex justify-between items-center gap-2">
            <span className="uppercase">Total</span>
            <Price className="text-3xl font-medium" amount={cart.subtotal || 0} />
          </div>
        </div>
      )}
    </div>
  )
}
