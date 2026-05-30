// // SMS Parser — detects Indian payment SMS and extracts expense data

// const patterns = [
//   // PhonePe
//   {
//     name: "PhonePe",
//     regex: /(?:PhonePe|PHONEPE).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
//     type: "debit",
//   },
//   // Google Pay
//   {
//     name: "Google Pay",
//     regex: /(?:Google Pay|GPay|GPAY).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
//     type: "debit",
//   },
//   // Paytm
//   {
//     name: "Paytm",
//     regex: /(?:Paytm|PAYTM).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
//     type: "debit",
//   },
//   // Generic debit
//   {
//     name: "Bank",
//     regex: /(?:debited|deducted|spent|paid|sent).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
//     type: "debit",
//   },
//   // Generic amount pattern
//   {
//     name: "Bank",
//     regex: /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?).*?(?:debited|deducted|spent|paid|sent)/i,
//     type: "debit",
//   },
// ];

// // Detect category from SMS text
// const detectCategory = (sms) => {
//   const text = sms.toLowerCase();
//   if (text.match(/swiggy|zomato|food|restaurant|cafe|eat|pizza|burger|hotel/)) return "Food";
//   if (text.match(/uber|ola|rapido|metro|bus|train|petrol|fuel|transport/)) return "Transport";
//   if (text.match(/amazon|flipkart|myntra|shopping|mall|store|shop/)) return "Shopping";
//   if (text.match(/netflix|hotstar|prime|spotify|movie|theatre|game/)) return "Entertainment";
//   if (text.match(/hospital|pharmacy|medicine|doctor|medical|health/)) return "Health";
//   if (text.match(/electricity|water|gas|internet|wifi|broadband|bill|recharge/)) return "Bills";
//   return "Other";
// };

// // Extract merchant/title from SMS
// const extractTitle = (sms) => {
//   // Try to find "to <merchant>" pattern
//   const toMatch = sms.match(/(?:to|at|for)\s+([A-Za-z0-9\s]+?)(?:\s+(?:on|via|for|from|using|\d)|$)/i);
//   if (toMatch) return toMatch[1].trim().slice(0, 30);

//   // Try to find merchant name after payment app name
//   const appMatch = sms.match(/(?:PhonePe|GPay|Paytm|Google Pay)\s*[:-]?\s*([A-Za-z0-9\s]+?)(?:\s+(?:Rs|INR|₹|\d)|$)/i);
//   if (appMatch) return appMatch[1].trim().slice(0, 30);

//   return "Payment";
// };

// const parseSMS = (smsText) => {
//   for (const pattern of patterns) {
//     const match = smsText.match(pattern.regex);
//     if (match) {
//       const amount = parseFloat(match[1].replace(/,/g, ""));
//       if (amount > 0) {
//         return {
//           success:  true,
//           amount,
//           title:    extractTitle(smsText),
//           category: detectCategory(smsText),
//           source:   pattern.name,
//           date:     new Date(),
//         };
//       }
//     }
//   }
//   return { success: false, message: "Could not parse SMS" };
// };

// module.exports = { parseSMS };
const patterns = [
  // PhonePe
  { name: "PhonePe", regex: /(?:PhonePe|PHONEPE).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i },
  // Google Pay
  { name: "Google Pay", regex: /(?:Google Pay|GPay|GPAY).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i },
  // Paytm
  { name: "Paytm", regex: /(?:Paytm|PAYTM).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i },
  // SBI — "debited by 25.00"
  { name: "SBI", regex: /debited by\s*([\d,]+(?:\.\d{1,2})?)/i },
  // HDFC — "debited INR 500"
  { name: "HDFC", regex: /(?:HDFC).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i },
  // ICICI
  { name: "ICICI", regex: /(?:ICICI).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i },
  // Axis
  { name: "Axis", regex: /(?:Axis).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i },
  // Generic debit
  { name: "Bank", regex: /(?:debited|deducted|spent|paid|sent).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i },
  // Generic amount first
  { name: "Bank", regex: /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?).*?(?:debited|deducted|spent|paid|sent)/i },
  // UPI generic — "debited by 25.00"
  { name: "UPI", regex: /(?:A\/C|AC|account).*?debited.*?([\d,]+(?:\.\d{1,2})?)/i },
];

const detectCategory = (sms) => {
  const text = sms.toLowerCase();
  if (text.match(/swiggy|zomato|food|restaurant|cafe|eat|pizza|burger|hotel/)) return "Food";
  if (text.match(/uber|ola|rapido|metro|bus|train|petrol|fuel|transport/)) return "Transport";
  if (text.match(/amazon|flipkart|myntra|shopping|mall|store|shop/)) return "Shopping";
  if (text.match(/netflix|hotstar|prime|spotify|movie|theatre|game/)) return "Entertainment";
  if (text.match(/hospital|pharmacy|medicine|doctor|medical|health/)) return "Health";
  if (text.match(/electricity|water|gas|internet|wifi|broadband|bill|recharge/)) return "Bills";
  return "Other";
};

const extractTitle = (sms) => {
  // SBI format — "trf to NAME"
  const trfMatch = sms.match(/trf to\s+([A-Z\s]+?)(?:\s+Ref|\s+If|$)/i);
  if (trfMatch) return trfMatch[1].trim().slice(0, 30);

  // "to <merchant>" pattern
  const toMatch = sms.match(/(?:to|at|for)\s+([A-Za-z0-9\s]+?)(?:\s+(?:on|via|for|from|using|\d)|$)/i);
  if (toMatch) return toMatch[1].trim().slice(0, 30);

  // App name pattern
  const appMatch = sms.match(/(?:PhonePe|GPay|Paytm|Google Pay)\s*[:-]?\s*([A-Za-z0-9\s]+?)(?:\s+(?:Rs|INR|₹|\d)|$)/i);
  if (appMatch) return appMatch[1].trim().slice(0, 30);

  return "Payment";
};

const parseSMS = (smsText) => {
  // Remove extra text user might have added
  const cleanSMS = smsText.split('\n')[0];
  
  for (const pattern of patterns) {
    const match = cleanSMS.match(pattern.regex) || smsText.match(pattern.regex);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ""));
      if (amount > 0) {
        return {
          success:  true,
          amount,
          title:    extractTitle(smsText),
          category: detectCategory(smsText),
          source:   pattern.name,
          date:     new Date(),
        };
      }
    }
  }
  return { success: false, message: "Could not parse SMS" };
};

module.exports = { parseSMS };