// payments/paystack/index.ts
import { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types';

import { confirmOrder } from './confirmOrder';
import { initiatePayment } from './initiatePayment';
import { webhooksEndpoint } from './webhook';
import type { GroupField } from 'payload';

export interface PaystackAdapterArgs {
  secretKey: string;
  publicKey: string;
  baseUrl?: string;
  paystackUrl?: string;
  webhooks?: {
    [eventType: string]: (args: {
      event: any;
      req: any;
    }) => Promise<void> | void;
  };
  label?: string;
  groupOverrides?: {
    fields?: 
      | ((args: { defaultFields: any[] }) => any[])
      | any[];
    admin?: any;
    [key: string]: any;
  };
}

export const paystackAdapter = (props: PaystackAdapterArgs): PaymentAdapter => {
  const { 
    secretKey, 
    publicKey, 
    baseUrl, 
    paystackUrl,
    webhooks,
    groupOverrides 
  } = props;
  
  const label = props?.label || 'Paystack';

  if (!secretKey) {
    throw new Error('Paystack secret key is required');
  }

  if (!publicKey) {
    throw new Error('Paystack public key is required');
  }

  // Define the default fields for the Paystack group
  const baseFields = [
    {
      name: 'reference',
      type: 'text' as const,
      label: 'Paystack Reference',
      admin: {
        readOnly: true
      }
    },
    {
      name: 'transactionId',
      type: 'number' as const,
      label: 'Paystack Transaction ID',
      admin: {
        readOnly: true
      }
    },
    {
      name: 'authorizationCode',
      type: 'text' as const,
      label: 'Authorization Code',
      admin: {
        readOnly: true
      }
    },
    {
      name: 'accessCode',
      type: 'text' as const,
      label: 'Access Code',
      admin: {
        readOnly: true
      }
    },
    {
      name: 'customerCode',
      type: 'text' as const,
      label: 'Customer Code',
      admin: {
        readOnly: true
      }
    }
  ];

  // Build the group field with conditional display
  const groupField: GroupField = {
    name: 'paystack',
    type: 'group',
    admin: {
      condition: (data: any) => {
        return data?.paymentMethod === 'paystack';
      },
      ...groupOverrides?.admin
    },
    fields: groupOverrides?.fields && typeof groupOverrides?.fields === 'function' 
      ? groupOverrides.fields({
          defaultFields: baseFields
        }) 
      : [
          ...baseFields,
          ...(Array.isArray(groupOverrides?.fields) ? groupOverrides.fields : [])
        ]
  };

  // Create endpoints array with webhooks
  const endpoints = [
    webhooksEndpoint({
      secretKey,
      baseUrl,
      webhooks
    })
  ];

  return {
    name: 'paystack',
    label,
    group: groupField,
    initiatePayment: initiatePayment({
      secretKey,
      publicKey,
      baseUrl,
      paystackUrl
    }),
    confirmOrder: confirmOrder({
      secretKey,
      baseUrl
    }),
    endpoints
  };
};

// Client-side adapter configuration
export interface PaystackAdapterClientArgs {
  publicKey: string;
  label?: string;
}

export const paystackAdapterClient = (props: PaystackAdapterClientArgs) => {
  const { publicKey, label } = props;

  if (!publicKey) {
    throw new Error('Paystack public key is required');
  }

  return {
    name: 'paystack',
    label: label || 'Paystack',
    initiatePayment: true,
    confirmOrder: true,
    publicKey // Pass public key to frontend
  };
};