import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const orderData = await request.json()

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 })
  }

  // Build a pretty message
  const message = `
🎉 *New Order Received!*

*Order ID:* #${orderData.id}
*Customer:* ${orderData.user_name}
*Phone:* ${orderData.phone}
*Address:* ${orderData.address}

*Items:*
${orderData.items.map((item: any) => `- ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

*Total:* $${orderData.total.toFixed(2)}
  `.trim()

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!tgRes.ok) {
      console.error('Telegram API error:', await tgRes.text())
      return NextResponse.json({ error: 'Failed to send Telegram message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Telegram fetch error:', err)
    return NextResponse.json({ error: 'Network error' }, { status: 500 })
  }
}