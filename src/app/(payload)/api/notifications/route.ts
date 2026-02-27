// src/app/(payload)/api/notifications/route.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Get low stock products (inventory < 10)
    const lowStockProducts = await payload.find({
      collection: 'products',
      where: {
        inventory: {
          less_than: 3,
          greater_than: 0,
        },
      },
      limit: 100,
    })

    // Get out of stock products (inventory = 0)
    const outOfStockProducts = await payload.find({
      collection: 'products',
      where: {
        inventory: {
          equals: 0,
        },
      },
      limit: 100,
    })

    // Get recent orders (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentOrders = await payload.find({
      collection: 'orders',
      where: {
        createdAt: {
          greater_than: oneDayAgo.toISOString(),
        },
      },
      sort: '-createdAt',
      limit: 50,
    })

    // Build notifications array
    const notifications: any[] = []

    // Add out of stock notifications
    outOfStockProducts.docs.forEach((product) => {
      notifications.push({
        id: `out-of-stock-${product.id}`,
        type: 'out-of-stock',
        title: 'Product Out of Stock',
        message: `${product.title} is out of stock`,
        timestamp: new Date(product.updatedAt),
        read: false,
        productId: product.id,
      })
    })

    // Add low stock notifications
    lowStockProducts.docs.forEach((product) => {
      notifications.push({
        id: `low-stock-${product.id}`,
        type: 'low-stock',
        title: 'Low Stock Alert',
        message: `${product.title} has only ${product.inventory} units left`,
        timestamp: new Date(product.updatedAt),
        read: false,
        productId: product.id,
      })
    })

    // Add recent order notifications (using correct field names)
    recentOrders.docs.slice(0, 10).forEach((order: any) => {
      const orderNumber = order.id // Use order ID as order number
      const orderAmount = order.amount || 0 // Field is "amount", not "total"
      
      // Build customer name from shipping address
      const customerName = order.shipping_address_first_name 
        ? `${order.shipping_address_first_name} ${order.shipping_address_last_name || ''}`.trim()
        : order.customer_email || 'Customer'
      
      // Determine notification type and title
      const isNewOrder = order.status === 'pending' || order.status === 'processing'
      const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1)
      
      notifications.push({
        id: `order-${order.id}`,
        type: isNewOrder ? 'new-order' : 'order-update',
        title: isNewOrder ? 'New Order Received' : `Order ${statusLabel}`,
        message: `Order #${orderNumber} - ${customerName} - ₦${orderAmount.toLocaleString()}`,
        timestamp: new Date(order.createdAt),
        read: false,
        orderId: order.id,
      })
    })

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return NextResponse.json({
      lowStockCount: lowStockProducts.totalDocs,
      outOfStockCount: outOfStockProducts.totalDocs,
      recentOrdersCount: recentOrders.totalDocs,
      notifications: notifications.slice(0, 50), // Limit to 50 notifications
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch notifications',
        lowStockCount: 0,
        outOfStockCount: 0,
        recentOrdersCount: 0,
        notifications: []
      },
      { status: 200 }, // Return 200 with empty data instead of 500
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}