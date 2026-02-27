import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { Plugin } from 'payload'

import { paystackAdapter } from '@/payments/paystack'

import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { ProductsCollection } from '@/collections/Products'
import { notifyAdminOrder } from '@/hooks/notifyAdmin'
import { updateProductSales } from '@/hooks/updateProductSales'
import { Page, Product } from '@/payload-types'
import { getEffectivePrice } from '@/utilities/getEffectivePrice'
import { getServerSideURL } from '@/utilities/getURL'
import { defaultCountries } from '@payloadcms/plugin-ecommerce/client/react'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Ecommerce Template` : 'Payload Ecommerce Template'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const NGN = {
  code: 'NGN',
  decimals: 0,
  label: 'Nigerian Naira',
  symbol: '₦',
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    currencies: {
      supportedCurrencies: [NGN],
      defaultCurrency: 'NGN',
    },

    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    customers: {
      slug: 'users',
    },
    payments: {
      paymentMethods: [
        // stripeAdapter({
        //   secretKey: process.env.STRIPE_SECRET_KEY!,
        //   publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        //   webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
        // }),

        paystackAdapter({
          secretKey: process.env.PAYSTACK_SECRET_KEY!,
          publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          // webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
          baseUrl: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}`,
          paystackUrl: 'https://api.paystack.co',
          webhooks: {
            'charge.success': async ({ event, req }) => {
              console.log('Payment successful:', event.data)
              req.payload.logger.info('Paystack payment succeeded')
            },
            'charge.failed': async ({ event, req }) => {
              console.log('Payment failed:', event.data)
              req.payload.logger.warn('Paystack payment failed')
            },
          },
        }),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },

    carts: {
      cartsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: defaultCollection.fields.map((field: any) => {
          if (field.name === 'items' && field.type === 'array') {
            return {
              ...field,
              fields: [
                ...field.fields,
                {
                  name: 'onSale',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { readOnly: true },
                },
                {
                  name: 'salePriceInNGN',
                  type: 'number',
                  admin: { readOnly: true },
                },
                {
                  name: 'regularPriceInNGN',
                  type: 'number',
                  admin: { readOnly: true },
                },
              ],
            }
          }
          return field
        }),
        hooks: {
          ...(defaultCollection?.hooks ?? {}),
          beforeChange: [
            ...((defaultCollection?.hooks?.beforeChange as any[]) ?? []),
            async ({ data, req }: any) => {
              if (!data?.items?.length) return data

              const resolvedItems = await Promise.all(
                data.items.map(async (item: any) => {
                  const product = await req.payload.findByID({
                    collection: 'products',
                    id: typeof item.product === 'object' ? item.product.id : item.product,
                    depth: 0,
                  })

                  return {
                    ...item,
                    priceInNGN: getEffectivePrice(product, 'NGN'),
                    onSale: product?.onSale ?? false,
                    salePriceInNGN: product?.salePriceInNGN ?? null,
                    regularPriceInNGN: product?.priceInNGN ?? null,
                  }
                }),
              )

              // Recalculate subtotal using the effective price × quantity for each item
              const subtotal = resolvedItems.reduce((total, item) => {
                const effectivePrice = item.priceInNGN ?? 0
                const quantity = item.quantity ?? 1
                return total + effectivePrice * quantity
              }, 0)

              return { ...data, items: resolvedItems, subtotal }
            },
          ],
        },
      }),
    },
    addresses: {
      addressesCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: defaultCollection.fields.filter((field) => {
          if ('name' in field) {
            return !['company', 'addressLine2'].includes(field.name)
          }
          return true
        }),
      }),

      supportedCountries: [...defaultCountries, { label: 'Nigeria', value: 'NG' }],
    },

    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        hooks: {
          ...defaultCollection.hooks,
          afterChange: [
            ...(defaultCollection.hooks?.afterChange || []),
            notifyAdminOrder,
            updateProductSales,
          ],
        },
      }),
    },
  }),
]
