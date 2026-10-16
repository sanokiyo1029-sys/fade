/** Footer pages. Plain copy; each section is [heading, paragraphs]. */
export interface InfoPage {
  title: string;
  lede: string;
  sections: [string, string[]][];
}

export const INFO: Record<string, InfoPage> = {
  about: {
    title: "About FADE",
    lede: "A marketplace built for independent creators who would rather do the work than win a bidding war.",
    sections: [
      ["Why we exist", ["Most marketplaces reward whoever replies fastest at the lowest price. We think that produces worse work and burns out the people doing it.", "FADE lists fixed-scope packages from vetted independents. Buyers know exactly what they get, creators know exactly what they owe, and payment sits in escrow until both sides agree the job is done."]],
      ["How we choose creators", ["Every creator is reviewed by a person before their first service goes live. We look at shipped work, references and how clearly they describe their scope."]],
      ["Where we are", ["FADE is a small team in Bengaluru. We work with creators in fourteen countries and bill in Indian rupees."]],
    ],
  },
  careers: {
    title: "Careers",
    lede: "We are a small team and hire slowly.",
    sections: [["Open roles", ["There are no open roles right now. If you think you should work here anyway, write to careers@fade.example with something you've built."]]],
  },
  press: {
    title: "Press",
    lede: "For interviews, data requests and brand assets.",
    sections: [["Contact", ["Write to press@fade.example. We reply within two working days."]], ["Brand", ["Please use the FADE wordmark in black or white only. Don't recolour, stretch or add effects to the dot mark."]]],
  },
  contact: {
    title: "Contact",
    lede: "The fastest way to reach us is from inside an order — every thread has a 'Get help' option that reaches a person.",
    sections: [["Support", ["support@fade.example · replies within 24 hours, every day."]], ["Trust & safety", ["trust@fade.example · for disputes, fraud and account security."]], ["Office", ["FADE Marketplace Pvt. Ltd., Indiranagar, Bengaluru 560038, India."]]],
  },
  help: {
    title: "Help centre",
    lede: "Answers to the questions we get most often.",
    sections: [
      ["When am I charged?", ["When you place an order. The money is held in escrow and only released to the creator when you approve the work."]],
      ["What if I'm not happy with the work?", ["Request a revision from the order page. If you can't resolve it with the creator, open a dispute and our team will review the brief, the files and the messages."]],
      ["Can I cancel?", ["You can cancel any order the creator hasn't confirmed yet for a full refund. After that, cancellation is agreed between you and the creator, or decided in a dispute."]],
      ["How do creators get paid?", ["Released funds reach the creator's balance immediately and can be withdrawn to a bank account in one to two working days."]],
    ],
  },
  security: {
    title: "Trust & safety",
    lede: "How we keep money, files and conversations safe.",
    sections: [
      ["Escrow", ["Payments are captured by our payment processor and held until the buyer approves the work. Creators never see card details."]],
      ["Keep it on FADE", ["Paying or communicating outside FADE removes escrow protection. We'll never ask you to move a conversation elsewhere."]],
      ["Accounts", ["Two-factor authentication is available in settings. Sessions can be revoked from any device."]],
      ["Report a problem", ["Write to trust@fade.example. We respond to security reports within 24 hours."]],
    ],
  },
  fees: {
    title: "Fees",
    lede: "One fee each side, shown before anyone pays.",
    sections: [["Buyers", ["A 5% service fee is added at checkout. It covers payment processing, escrow and dispute support."]], ["Creators", ["FADE keeps 10% of each completed order. There are no listing fees, subscriptions or charges to withdraw."]]],
  },
  "seller-levels": {
    title: "Seller levels",
    lede: "Levels reflect track record on FADE, not years in the industry.",
    sections: [
      ["Emerging", ["Every new creator starts here. Your first five orders are reviewed by our team for quality."]],
      ["Established", ["Twenty completed orders, a rating of 4.7 or higher and at least 90% on-time delivery."]],
      ["Elite", ["Invitation only. One hundred completed orders, a 4.9 rating and a record of repeat clients."]],
    ],
  },
  terms: {
    title: "Terms of service",
    lede: "The short version: be honest about scope, deliver what you sold, pay for what you ordered.",
    sections: [
      ["Using FADE", ["You must be 18 or older and provide accurate account details. One person, one account."]],
      ["Orders", ["A package is a fixed-scope offer. When a buyer places an order and the creator confirms it, both are bound by the package description and the brief."]],
      ["Payments", ["Buyers pay into escrow. Funds are released when the buyer approves the work, or automatically three days after delivery if the buyer doesn't respond."]],
      ["Ownership", ["On release of payment, the buyer owns the final deliverables unless the package says otherwise. Creators may show the work in their portfolio unless agreed in writing."]],
      ["Disputes", ["Either side can open a dispute. Our decision is based on the package, the brief, the files and the messages on FADE."]],
    ],
  },
  privacy: {
    title: "Privacy policy",
    lede: "What we collect, why, and how to get it deleted.",
    sections: [
      ["What we collect", ["Account details you give us, the content of orders and messages, and basic usage data needed to run the service."]],
      ["What we don't do", ["We don't sell personal data and we don't use your messages to train models."]],
      ["Your rights", ["You can export or delete your data from settings, or by writing to privacy@fade.example."]],
    ],
  },
  cookies: {
    title: "Cookies",
    lede: "We use as few as we can.",
    sections: [["Essential", ["Session and security cookies keep you signed in. They can't be turned off."]], ["Analytics", ["Aggregate, cookieless page counts only. No advertising trackers."]]],
  },
};

export const INFO_SLUGS = Object.keys(INFO);
