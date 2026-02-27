import { CollectionAfterChangeHook } from 'payload'

export const notifyAdminOrder: CollectionAfterChangeHook = async ({ doc, operation, req }: any) => {
  if (operation !== 'create') return

  console.log('New order created:', doc)

  const payload = req.payload

  const adminURL = `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/admin/collections/orders/${doc.id}`

  const fullName = `${doc.shippingAddress.firstName} ${doc.shippingAddress.lastName}`

  const addressBlock = `
      ${doc.shippingAddress.addressLine1}
      ${doc.shippingAddress.city}, ${doc.shippingAddress.state}
      ${doc.shippingAddress.postalCode}
      ${doc.shippingAddress.country}
      ${doc.shippingAddress.phone}
`

  const itemsList = doc.items
    ?.map(
      (item: any) => `• ${item.product?.title || item.title} x${item.quantity} - ₦${item.product.priceInNGN}`,
    )
    .join('\n')


  /*
   =========================
   1️⃣ SEND EMAIL
   =========================
  */
  try {
    await payload.sendEmail({
      to: process.env.ADMIN_EMAIL!,
      from: process.env.DEFAULT_FROM_EMAIL!,
      subject: `New Order — ₦${doc.amount.toLocaleString()}`,
      html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; max-width:600px; margin:auto; padding:24px;">
            
            <h2 style="margin-bottom:4px;">New Order</h2>
            <p style="color:#666; margin-top:0;">
              ${new Date(doc.createdAt).toLocaleString()}
            </p>

            <hr style="margin:24px 0;" />

            <p><strong>Order ID:</strong> ${doc.id}</p>
            <p><strong>Status:</strong> ${doc.status}</p>
            <p><strong>Total:</strong> ₦${doc.amount.toLocaleString()} ${doc.currency}</p>

            <hr style="margin:24px 0;" />

            <h4 style="margin-bottom:6px;">Customer</h4>
            <p style="margin-top:0;">
              ${fullName}<br/>
              ${doc.customer?.email}
            </p>

            <h4 style="margin-bottom:6px;">Shipping Address</h4>
            <p style="white-space:pre-line; margin-top:0;">
        ${addressBlock}
            </p>

            <h4 style="margin-bottom:6px;">Items</h4>
            <p style="white-space:pre-line; margin-top:0;">
        ${itemsList}
            </p>

            <div style="margin-top:32px;">
              <a href="${adminURL}" 
                style="display:inline-block; padding:10px 16px; 
                        background:#111; color:#fff; 
                        text-decoration:none; border-radius:6px;">
                View Order
              </a>
            </div>

          </div>
          `,
    })

    payload.logger.info(`Email sent for order ${doc.id}`)
  } catch (error) {
    payload.logger.error(error, 'Failed to send admin email')
  }

  /*
   =========================
   2️⃣ SEND TELEGRAM
   =========================
  */
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!token || !chatId) {
      payload.logger.warn('Telegram credentials missing')
      return
    }
    const telegramMessage = `
      🛒 *New Order*

        *Total:* ₦${doc.amount.toLocaleString()} ${doc.currency}
        *Status:* ${doc.status}

        *Customer*
        ${fullName}
        ${doc.customer?.email}

        *Shipping*
        ${doc.shippingAddress.addressLine1}
        ${doc.shippingAddress.city}, ${doc.shippingAddress.state}
        ${doc.shippingAddress.postalCode}
        ${doc.shippingAddress.country}
        ${doc.shippingAddress.phone}

        *Items*
        ${itemsList}

        🔗 [Open in Admin](${adminURL})
        `
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'Markdown',
      }),
    })

    payload.logger.info(`Telegram sent for order ${doc.id}`)
  } catch (error) {
    payload.logger.error(error, 'Failed to send Telegram notification')
  }
}
