// src/app/(payload)/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server'

// ⭐ Must export as POST function with proper params typing
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // In a real app, you'd store read status in a database
    // For now, we'll just return success
    // You can extend this to store in a notifications collection
    
    console.log(`Marking notification ${id} as read`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 },
    )
  }
}

// ⭐ Optional: Add OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}