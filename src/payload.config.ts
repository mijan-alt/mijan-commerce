import { mongooseAdapter } from '@payloadcms/db-mongodb'

import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { Settings } from '@/globals/Settings'

import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { Blogs } from './collections/Blogs'
import { Brands } from './collections/Brands'
import { Col } from './collections/Col'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      actions: ['@/components/NotificationButton#NotificationButton'],
    },

    dashboard: {
      defaultLayout: ({ req }) => {
        return [
          { widgetSlug: 'todays-revenue', width: 'small' },
          { widgetSlug: 'orders-today', width: 'small' },
          { widgetSlug: 'total-products', width: 'small' },
          { widgetSlug: 'total-customers', width: 'small' },
        ]
      },
      widgets: [
        {
          slug: 'todays-revenue',
          ComponentPath: '@/components/dashboard/TodaysRevenue#default',
          minWidth: 'small',
          maxWidth: 'medium',
        },
        {
          slug: 'total-customers',
          ComponentPath: '@/components/dashboard/TotalCustomers#default',
          minWidth: 'small',
          maxWidth: 'medium',
        },
        {
          slug: 'total-products',
          ComponentPath: '@/components/dashboard/TotalProducts#default',
          minWidth: 'small',
          maxWidth: 'medium',
        },
      ],
    },
    user: Users.slug,
  },
  collections: [Users, Pages, Media, Brands, Categories, Col, Blogs],
 
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  email: nodemailerAdapter({
    defaultFromAddress: 'mijanigoni@gmail.com',
    defaultFromName: 'Ecommerce Store',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  endpoints: [],
  globals: [Header, Footer, Settings],
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
