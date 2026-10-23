# Razorpay Payment Gateway Integration — Phase 1: Client Management

This document details the production-ready implementation of the Razorpay payment system for FlexiStaff Client Management (Phase 1 Mini Project).

---

## 1. Architecture & Security Highlights

### A. Strict Client Ownership & Backend Calculated Values
- **Trusted Financial Source:** The client can never dictate the payable amount. The backend computes the outstanding balance using `BigDecimal`:
  $$\text{Remaining Balance} = \text{Agreed Project Budget} - \sum \text{Verified Successful Payments}$$
- **Zero & Overpayment Prevention:** Requests for amounts $\le 0$ or amounts greater than the remaining balance are rejected with HTTP 400 (`BadRequestException`).
- **Authorization Enforcement:** Only the project's authenticated client (or Admin/Manager) can query payment summaries or initiate Razorpay orders.

### B. Two-Tier Verification & Cryptographic Signatures
1. **Frontend Signature Verification:**
   - Verifies the HMAC-SHA256 signature generated over `${razorpayOrderId}|${razorpayPaymentId}` with constant-time equality check (`MessageDigest.isEqual`) to avoid timing attacks.
   - Cross-checks order status directly with Razorpay API (`https://api.razorpay.com/v1/payments/{paymentId}`).
2. **Server-Side Asynchronous Webhook Reconciler:**
   - Endpoint: `POST /api/v1/payments/webhook`
   - Verifies `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET` using raw request payload.
   - Idempotent: Repeated webhooks never create duplicate transactions or double-credit projects.
   - Monotonic State Guarantee: A successful payment (`SUCCESS`) is never downgraded to `FAILED` by delayed/duplicate failure webhooks.

### C. Downloadable Tax Invoice / Official Payment Receipt
- Issued strictly for verified transactions (`SUCCESS`).
- Formatted with unique receipt number (`RCP-...`), client company details, project ID & name, amount paid, payment method, Razorpay reference, timestamp, and official company header with Print-to-PDF support.

---

## 2. API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/payments/config/key-id` | Retrieve public Razorpay Key ID | No (Public) |
| `GET` | `/api/v1/payments/project/{projectId}/summary` | Retrieve agreed cost, paid amount, remaining balance & status | Yes (Client/Admin/Manager) |
| `POST` | `/api/v1/payments/orders` | Create Razorpay server-side payment order | Yes (Project Owner) |
| `POST` | `/api/v1/payments/verify` | Verify checkout HMAC-SHA256 signature and update balance | Yes (Project Owner) |
| `POST` | `/api/v1/payments/webhook` | Asynchronous Razorpay webhook reconciler | Verified via `X-Razorpay-Signature` |
| `GET` | `/api/v1/payments/history` | View client transaction history | Yes (Client/Admin) |
| `GET` | `/api/v1/payments/{paymentId}/receipt` | Generate official tax invoice/receipt | Yes (Client/Admin) |

---

## 3. Environment Configuration

Copy `.env.example` or configure `application.yml` / system environment variables:

```bash
# Razorpay Credentials (Test Mode)
RAZORPAY_KEY_ID=rzp_test_placeholderKeyId
RAZORPAY_KEY_SECRET=placeholderKeySecret
RAZORPAY_WEBHOOK_SECRET=placeholderWebhookSecret
RAZORPAY_CURRENCY=INR
RAZORPAY_COMPANY_NAME="FlexiStaff Technologies Pvt Ltd"
```

> **Security Note:** Real keys must never be committed to Git. If keys are not configured, the backend starts gracefully and informs the user when attempting live order creation.

---

## 4. Razorpay Dashboard & Webhook Setup

### A. Generating Test Keys
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** (toggle on the top right).
3. Navigate to **Account & Settings** $\rightarrow$ **API Keys**.
4. Click **Generate Key**. Copy your `Key Id` and `Key Secret`.
5. Set them as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

### B. Configuring Webhooks
1. In Razorpay Dashboard, navigate to **Account & Settings** $\rightarrow$ **Webhooks**.
2. Click **Add New Webhook**.
3. Set the **Webhook URL**:
   - For local development with ngrok: `https://<your-ngrok-id>.ngrok-free.app/api/v1/payments/webhook`
   - For production: `https://api.yourdomain.com/api/v1/payments/webhook`
4. Set a strong secret string and configure it as `RAZORPAY_WEBHOOK_SECRET`.
5. Select the following **Active Events**:
   - `payment.captured`
   - `order.paid`
   - `payment.failed`
6. Click **Save Webhook**.

---

## 5. Automated Verification Results

All automated test suites executed successfully:

| Test # | Description | Expected | Result |
|---|---|---|---|
| **1** | Client Authentication & JWT Validation | HTTP 200 + Valid token | **PASS** |
| **2** | Project 1 Payment Summary Calculation | Cost: ₹50,000, Paid: ₹0, Bal: ₹50,000 | **PASS** |
| **3** | Client Payment History Query | Filtered to authenticated client | **PASS** |
| **4** | Razorpay Public Key ID Exposure | Returns public key safely without secret | **PASS** |
| **5** | Zero / Negative Payment Rejection | HTTP 400 Bad Request | **PASS** |
| **6** | Overpayment Rejection (> Outstanding Balance) | HTTP 400 Bad Request | **PASS** |
| **7** | Tampered / Invalid Signature Rejection | HTTP 400/404 Rejected | **PASS** |
| **8** | Tampered Webhook Signature Rejection | HTTP 400 Rejected | **PASS** |
| **9** | Verified Payment & Balance Recalculation | Outstanding balance decreases accurately | **PASS** |
| **10** | Official Downloadable Receipt Generation | Unique RCP #, client details, valid JSON | **PASS** |
| **11** | Frontend Vite Production Build | 0 errors, 100% bundled | **PASS** |
