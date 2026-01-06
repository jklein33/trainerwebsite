# Stripe Integration Setup Guide

This guide explains how to set up Stripe MCP (Model Context Protocol) in Cursor IDE and configure the Stripe payment integration for the Dawg Strength website.

## Table of Contents
1. [Stripe MCP Setup in Cursor](#stripe-mcp-setup-in-cursor)
2. [Stripe Integration Overview](#stripe-integration-overview)
3. [Environment Variables](#environment-variables)
4. [Testing the Integration](#testing-the-integration)
5. [Architecture Overview](#architecture-overview)

---

## Stripe MCP Setup in Cursor

### Prerequisites
- Cursor IDE installed
- Stripe account (test or live mode)
- Stripe API keys

### Step 1: Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Click **Reveal test key** and copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### Step 2: Configure Stripe MCP in Cursor

1. Open Cursor IDE
2. Go to **Settings** → **Features** → **Model Context Protocol** (or search for "MCP" in settings)
3. Add a new MCP server configuration:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-stripe"
      ],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_your_secret_key_here"
      }
    }
  }
}
```

**Important Notes:**
- Replace `sk_test_your_secret_key_here` with your actual Stripe secret key
- Use test keys (`sk_test_`) for development
- Use live keys (`sk_live_`) only in production
- The secret key is used server-side only and never exposed to the client

### Step 3: Verify MCP Connection

After configuring, you can verify the connection by asking Cursor's AI:
- "List my Stripe products"
- "Show me my Stripe prices"
- "Check my Stripe account balance"

The AI should be able to access your Stripe account through MCP.

---

## Stripe Integration Overview

### What Was Built

A complete Stripe Checkout integration for the "Dawg Strength Program" with:

1. **API Route** (`app/api/checkout/route.ts`)
   - Creates Stripe checkout sessions
   - Validates price IDs for security
   - Handles errors gracefully

2. **Packages Component** (`components/packages.tsx`)
   - Client-side checkout button
   - Loading states and error handling
   - Redirects to Stripe Checkout

3. **Success Page** (`app/success/page.tsx`)
   - Confirmation page after successful payment
   - Handles missing session IDs

### Current Product Configuration

- **Product Name**: "Dawg Strength Program - Annual (Beta)"
- **Product ID**: `prod_TjsJNmS6MVis08`
- **Price ID**: `price_1SmOZKKx2xkrGl8oz8fTBYpI`
- **Amount**: $6,000.00 (one-time payment)
- **Currency**: USD

---

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Stripe Secret Key (server-side only)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Stripe Publishable Key (client-side safe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Price ID (the price you want to sell)
NEXT_PUBLIC_STRIPE_PRICE_ID=price_1SmOZKKx2xkrGl8oz8fTBYpI
```

### Important Notes:

1. **Never commit `.env.local` to git** - It's already in `.gitignore`
2. **Use test keys for development** - Test keys start with `sk_test_` and `pk_test_`
3. **Use live keys for production** - Live keys start with `sk_live_` and `pk_live_`
4. **The `NEXT_PUBLIC_` prefix** makes variables available to the browser (safe for publishable keys only)

### Getting Your Price ID

If you need to find or create a new price:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click on your product
3. Find the **Price ID** (starts with `price_`)
4. If no price exists, click **Add another price** and create one
5. Copy the Price ID to your `.env.local`

---

## Testing the Integration

### Step 1: Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Test the Checkout Flow

1. Navigate to `http://localhost:3000`
2. Scroll to the **Packages** section
3. Click the **"Get Started"** button
4. You should be redirected to Stripe Checkout

### Step 4: Use Test Card Numbers

Stripe provides test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any:
- **Expiry**: Future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### Step 5: Verify Success

After completing a test payment:
- You should be redirected to `/success` page
- Check your Stripe Dashboard → **Payments** to see the test payment
- Check your email for the receipt (if configured)

---

## Architecture Overview

### File Structure

```
app/
├── api/
│   └── checkout/
│       └── route.ts          # Server-side API route for creating checkout sessions
├── success/
│   └── page.tsx             # Success page after payment
└── page.tsx                  # Homepage (includes Packages component)

components/
└── packages.tsx             # Client component with checkout button
```

### Flow Diagram

```
User clicks "Get Started"
    ↓
Client Component (packages.tsx)
    ↓
POST /api/checkout with priceId
    ↓
API Route (route.ts)
    ↓
Creates Stripe Checkout Session
    ↓
Returns sessionId
    ↓
Client redirects to Stripe Checkout
    ↓
User completes payment
    ↓
Redirects to /success?session_id=xxx
```

### Security Features

1. **Server-side validation**: Price IDs are validated on the server
2. **Environment variable protection**: Secret keys never exposed to client
3. **Allowed price list**: Only approved price IDs can be used
4. **Error handling**: Graceful error messages without exposing internals

### Best Practices Implemented

- ✅ **Next.js 16 patterns**: Async server components, proper searchParams handling
- ✅ **TypeScript**: Full type safety throughout
- ✅ **Error handling**: Comprehensive error handling at all levels
- ✅ **Code splitting**: Dynamic imports for Stripe.js
- ✅ **Security**: Server-side validation, no key exposure
- ✅ **UX**: Loading states, clear error messages

---

## Troubleshooting

### Issue: "Module not found: Can't resolve '@stripe/stripe-js'"

**Solution**: Run `npm install` to install dependencies

### Issue: "No such price" error

**Solution**: 
- Verify your `NEXT_PUBLIC_STRIPE_PRICE_ID` matches a price in your Stripe Dashboard
- Make sure you're using a Price ID (starts with `price_`), not a Product ID (starts with `prod_`)

### Issue: "Stripe connection error"

**Solution**:
- Check your `STRIPE_SECRET_KEY` is correct
- Verify your internet connection
- Make sure you're using the correct API version

### Issue: Cancel button goes to wrong page

**Solution**: Already fixed! Cancel URL points to `/#packages` (homepage with anchor)

### Issue: Environment variables not working

**Solution**:
- Make sure `.env.local` is in the project root
- Restart your dev server after adding/changing environment variables
- Verify variable names match exactly (case-sensitive)

---

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Stripe Test Cards](https://stripe.com/docs/testing)

---

## Support

If you encounter issues:
1. Check the browser console for client-side errors
2. Check the terminal/server logs for server-side errors
3. Verify all environment variables are set correctly
4. Test with Stripe's test card numbers
5. Check Stripe Dashboard for payment status

---

**Last Updated**: January 2025
**Integration Version**: Next.js 16 + Stripe Checkout

