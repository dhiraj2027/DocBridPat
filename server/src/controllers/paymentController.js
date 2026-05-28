import stripe from '../utils/stripe.js'
import Plan from '../models/SubscriptionPlan.js'
import User from '../models/User.js'

//Creates the stripe checkout session and returns the URL
export const createCheckoutSession = async (req, res, next) => {
    try {
        
        const { planId } = req.body
        const userId = req.user.id

        if(!planId) {
            return res.status(400).json({
                message: 'Plan ID is required'
            })
        }

        const plan = await Plan.findById(planId)

        if(!plan || !plan.isActive) {
            return res.status(404).json({
                message: 'Plan not found or inactive'
            })
        }

        const user = await User.findById(userId)

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        // Create stripe checkout session (one time payment for credits)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',

            // What the patient is buying
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: Math.round(plan.price * 100),

                        product_data: {
                            name: plan.name,
                            description: `${plan.credits} appointment credits`
                        }
                    },
                    quantity: 1
                }
            ],


            // Passing metadata so webhook knows what to do after payment
            metadata: {
                userId: userId.toString(),
                planId: planId.toString(),
                credits: plan.credits.toString()
            },


            // Where to redirect after payment
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

            cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,

            //Pre-fill customer email
            customer_email: user.email
        })

        res.json({
            url: session.url,
            sessionId: session.id
        })

    } catch (error) {
        next(error)
    }
}


// Stripe webhook
// Stripe calls this endpoint after payment is completed and we verify the signature to confirm it's really from stripe
// Then we credit the user's account
export const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature']

    let event

    try {
        
        // req.body must be raw Buffer here (not parsed JSON), this is why we use express.raw() for this route
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )

    } catch (err) {
        console.error('Webhook signature verification failed: ', err.message)

        return res.status(400).json({
            message: `Webhook error: ${err.message}`
        })
    }


    // Handle the checkout.session.completed event
    if(event.type === 'checkout.session.completed') {
        const session = event.data.object

        // Only process if payment was successful
        if(session.payment_status === 'paid') {
            const { userId, credits } = session.metadata

            try {
                
                await User.findByIdAndUpdate(userId, {
                    $inc: { credits: parseInt(credits) }
                })

                console.log(`Credits added: ${credits} to user ${userId}`)

            } catch (err) {
                console.error('Failed to add credits after payment:', err.message)

                // Return 500 so Stripe retries the webhook
                return res.status(500).json({
                    message: 'Failed to update credits'
                })
            }
        }
    }

    // Always return 200 to Stripe so it knows we received the event
    res.json({
        received: true
    })
}


// Verify session
// Called on the success page to confirm payment and get updated credits
// Prevents users from manually navigating to /payment/success
export const verifySession = async (req, res, next) => {
    try {
        
        const { sessionId } = req.params

        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if(session.payment_status !== 'paid') {
            return res.status(400).json({
                message: 'Payment not completed'
            })
        }

        const creditsAdded = parseInt(session.metadata.credits)

        const user = await User.findById(req.user.id).select('credits name email')

        res.json({
            success: true,
            totalCredits: user.credits,
            creditsAdded,
            amount: session.amount_total / 100,
            planName: session.metadata?.planName || 'Credits Package'
        })

    } catch (error) {
        next(error)
    }
}