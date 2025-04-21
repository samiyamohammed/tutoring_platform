import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get the transaction reference from the query parameters
  const searchParams = request.nextUrl.searchParams
  const tx_ref = searchParams.get("tx_ref")

  if (!tx_ref) {
    return NextResponse.json({ status: "error", message: "Transaction reference is required" }, { status: 400 })
  }

  try {
    // Verify the transaction with Chapa
    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (data.status === "success") {
      // Transaction was successful
      // In a real application, you would update your database here
      return NextResponse.json({
        status: "success",
        message: "Payment verified successfully",
        data: data.data,
      })
    } else {
      return NextResponse.json(
        { status: "error", message: data.message || "Payment verification failed" },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { status: "error", message: "An unexpected error occurred during verification" },
      { status: 500 },
    )
  }
}

// Handle webhook notifications from Chapa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify the webhook signature (if Chapa provides one)
    // This is a security best practice

    // Process the webhook data
    const { event, data } = body

    // Handle different event types
    switch (event) {
      case "charge.completed":
        // Payment was successful
        // Update your database, enroll the student, etc.
        console.log("Payment successful:", data)
        break
      case "charge.failed":
        // Payment failed
        console.log("Payment failed:", data)
        break
      default:
        console.log("Unhandled webhook event:", event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ status: "error", message: "Failed to process webhook" }, { status: 500 })
  }
}
