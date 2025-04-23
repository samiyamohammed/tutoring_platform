import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, email, firstName, lastName, title, returnUrl, cancelUrl } = body

    // Validate required fields
    if (!amount || !email || !firstName || !lastName || !title) {
      return NextResponse.json({ status: "error", message: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique transaction reference
    const tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000000)}`

    // Prepare the request to Chapa API
    const chapaData = {
      amount,
      currency: "ETB",
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref,
      callback_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/student/payment/success`,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/student/payment/success`,
      customization: {
        title,
        description: `Payment for ${title}`,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
    }

    // Make request to Chapa API
    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
      body: JSON.stringify(chapaData),
    })

    const responseData = await response.json()

    if (responseData.status === "success") {
      return NextResponse.json({
        status: "success",
        message: "Checkout URL created",
        data: responseData.data,
      })
    } else {
      console.error("Chapa API error:", responseData)
      return NextResponse.json(
        {
          status: "error",
          message: responseData.message || "Failed to initialize payment",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ status: "error", message: "An unexpected error occurred" }, { status: 500 })
  }
}
