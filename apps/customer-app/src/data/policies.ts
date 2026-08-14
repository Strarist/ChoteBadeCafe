import { site } from "./site"

const updated = "14 August 2026"

export type PolicyId = "privacy" | "terms" | "refunds" | "shipping"

export type PolicyDoc = {
  id: PolicyId
  title: string
  eyebrow: string
  updated: string
  intro: string
  sections: { heading: string; paragraphs: string[] }[]
}

export const policies: Record<PolicyId, PolicyDoc> = {
  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    eyebrow: "How we handle your details",
    updated,
    intro: `${site.fullName} (“we”, “us”) respects your privacy. This Privacy Policy explains what personal information we collect when you use ${site.website} or order at our café, why we collect it, and how we use it.`,
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          `${site.fullName} is a café at ${site.addressFull}. You can reach us at ${site.email} or ${site.phone}.`,
        ],
      },
      {
        heading: "Information we collect",
        paragraphs: [
          "When you place an order on this website, we collect your name, mobile number, and optional email address, along with your table number (if you scanned a QR code), the items you ordered, special kitchen notes, and payment status.",
          "We do not require you to create an account or log in to complete a payment.",
          "Payment card, UPI, and bank details are collected and processed by Razorpay. We do not store your full card number, CVV, or UPI PIN on our servers.",
        ],
      },
      {
        heading: "Why we use this information",
        paragraphs: [
          "We use your details to take and fulfil dine-in / counter-pickup orders, confirm payment, send order status updates, and contact you if there is a problem with an order.",
          "We may also use anonymised order data to improve the menu and café operations. We do not sell your personal information.",
        ],
      },
      {
        heading: "Sharing",
        paragraphs: [
          "We share information only as needed to run the café: with Razorpay to process payments; with our kitchen / POS partner to prepare your order; and with professional advisers or authorities if the law requires it.",
          `Delivery orders placed on Zomato or Swiggy are handled by those platforms under their own privacy policies. This website is for café ordering and pickup at ${site.address}.`,
        ],
      },
      {
        heading: "Storage and security",
        paragraphs: [
          "Order records are stored on our servers so we can fulfil, support, and account for payments. We keep them only as long as needed for operations, tax, and dispute resolution, then delete or anonymise them.",
          "Your browser may store cart contents locally on your device. You can clear this at any time from the cart or by clearing site data.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Under the Digital Personal Data Protection Act, 2023, you may request access, correction, or deletion of your personal data, or withdraw consent where processing is based on consent. Write to us at the email or address below. We may need to retain some records where the law requires it (for example, paid invoices).",
        ],
      },
      {
        heading: "Grievance officer",
        paragraphs: [
          `For privacy questions or complaints, contact ${site.fullName}, ${site.addressFull}, email ${site.email}, phone ${site.phone}. We aim to respond within 7 business days.`,
        ],
      },
    ],
  },
  terms: {
    id: "terms",
    title: "Terms and Conditions",
    eyebrow: "The house rules",
    updated,
    intro: `These Terms and Conditions govern your use of ${site.website} and orders placed with ${site.fullName}. By browsing the site or placing an order, you agree to these terms.`,
    sections: [
      {
        heading: "The café",
        paragraphs: [
          `${site.fullName} is a quick-service café serving ${site.cuisines} from ${site.addressFull}.`,
          site.mantra,
        ],
      },
      {
        heading: "Ordering on this website",
        paragraphs: [
          "This website is for dine-in and counter pickup. Scan a table QR or order from the menu, pay, then collect from the counter when your token is called.",
          "You must provide an accurate name and mobile number. You do not need an account to pay.",
          "Menu items, descriptions, and prices are shown in Indian Rupees (INR) on the Menu page. Prices may include applicable taxes. We may change the menu or prices at any time; the price charged is the price shown when you confirm the order.",
        ],
      },
      {
        heading: "Payment",
        paragraphs: [
          "You may pay at the counter or online (UPI / card) via Razorpay. Online orders are sent to the kitchen only after payment succeeds.",
          "Opening offers advertised in-café or on flyers (for example BOGO beverages or food discounts) are limited-period, subject to availability, and cannot be combined unless we say so at the counter.",
        ],
      },
      {
        heading: "Food and allergens",
        paragraphs: [
          "Food is prepared fresh to order. If you have an allergy or dietary need, tell us in the kitchen note and speak to staff before you eat. Cross-contamination is possible in a small kitchen.",
        ],
      },
      {
        heading: "Delivery",
        paragraphs: [
          `We deliver through ${site.deliveryPartners}. Those orders are contracts with those platforms, not with this website. Platform fees, ETAs, and support follow their terms.`,
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: [
          "Do not misuse the site, attempt to interfere with payments or orders, or place orders you do not intend to collect. We may refuse or cancel an order if we reasonably believe it is fraudulent, unsafe, or cannot be fulfilled.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "To the fullest extent permitted by Indian law, we are not liable for delays caused by kitchen volume, payment-gateway outages, or events outside our control. Nothing in these terms limits liability for death, personal injury, or fraud caused by our negligence.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          "These terms are governed by the laws of India. Courts in Gurugram, Haryana have exclusive jurisdiction, without affecting any rights you have as a consumer under applicable law.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `Questions: ${site.email}, ${site.phone}, or visit us at ${site.addressFull}.`,
        ],
      },
    ],
  },
  refunds: {
    id: "refunds",
    title: "Cancellation and Refund Policy",
    eyebrow: "If an order does not go to plan",
    updated,
    intro: `${site.fullName} prepares food to order. This Cancellation and Refund Policy explains when you can cancel, when we refund, and how long a refund takes.`,
    sections: [
      {
        heading: "Cancelling an order on this website",
        paragraphs: [
          "Ask staff or write to us immediately after you pay if you need to cancel. If the kitchen has not started the order, we will cancel it and issue a full refund of the amount paid.",
          "Once preparation has started, food cannot be restocked. We generally cannot cancel or refund after that point, except as described below.",
        ],
      },
      {
        heading: "Wrong, missing, or unfit items",
        paragraphs: [
          "Tell the counter before you leave if an item is missing, materially different from the menu, or not reasonably fit to eat. We will remake the item or refund that item (or the full order if we cannot make it right).",
          "Taste preference, change of mind after collection, or delay in collecting a ready token are not grounds for a refund.",
        ],
      },
      {
        heading: "Failed or duplicate payments",
        paragraphs: [
          "If a payment is captured but the order is not created, or you are charged twice, contact us with the payment ID. We will refund the extra amount in full.",
        ],
      },
      {
        heading: "How refunds are paid",
        paragraphs: [
          "Online refunds are sent to the original payment method (UPI, card, or netbanking) through Razorpay. After we initiate a refund, the amount typically appears in 5–7 business days, depending on your bank.",
          "Pay-at-counter orders are settled at the till. Speak to the cashier the same visit.",
        ],
      },
      {
        heading: "Zomato and Swiggy",
        paragraphs: [
          `Orders placed on ${site.deliveryPartners} follow that platform’s cancellation and refund rules. Raise those requests in the Zomato or Swiggy app.`,
        ],
      },
      {
        heading: "How to request a refund",
        paragraphs: [
          `Email ${site.email} or call ${site.phone} with your name, mobile number, order token or payment ID, and the reason. We aim to confirm the outcome within 2 business days.`,
        ],
      },
    ],
  },
  shipping: {
    id: "shipping",
    title: "Shipping Policy",
    eyebrow: "How food reaches you",
    updated,
    intro: `${site.fullName} is a café. This Shipping Policy explains how orders from this website are fulfilled and when delivery applies.`,
    sections: [
      {
        heading: "No courier shipping on this website",
        paragraphs: [
          "Orders placed on this website are for dine-in and counter pickup only. We do not ship food by courier, post, or third-party logistics from chotebadecafe.com.",
          `Collect your order at ${site.addressFull} when your token is called. Typical wait is a few minutes after payment, depending on kitchen volume.`,
        ],
      },
      {
        heading: "When the order is ready",
        paragraphs: [
          "Online orders are sent to the kitchen after successful payment. Pay-at-counter orders are sent after you confirm at the till.",
          "Please collect promptly. We cannot guarantee quality if a ready order sits uncollected.",
        ],
      },
      {
        heading: "Delivery via Zomato and Swiggy",
        paragraphs: [
          `We deliver through ${site.deliveryPartners}. Delivery area, fees, packaging, and estimated time are set by those apps, not by this website.`,
          "If you need food delivered to an address, place the order in Zomato or Swiggy. Do not use this website’s checkout for delivery.",
        ],
      },
      {
        heading: "Damaged or incomplete pickup",
        paragraphs: [
          "Check your bag at the counter. If something is missing or spilled before you leave, we will remake or refund that item under our Cancellation and Refund Policy.",
        ],
      },
    ],
  },
}

export const policyByPath: Record<string, PolicyId> = {
  "/privacy": "privacy",
  "/terms": "terms",
  "/refunds": "refunds",
  "/shipping": "shipping",
}
