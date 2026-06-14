/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const defaults = {
  whatsappNumber: "919911690027",
  businessName: "Shiv Saya Properties",
  consultantName: "Ritik Khari",
  businessEmail: "info@shivsayaproperties.com",
  businessPhone: "+91-9911690027",
  businessAddress: "Delhi NCR, India",
  reraNumber: "RERA-DELHI-NCR-XXXX",
};

// Merge from localStorage on load if available
let storedSettings: any = null;
try {
  const settingsStr = typeof window !== "undefined" ? localStorage.getItem("ssp_settings") : null;
  if (settingsStr) {
    storedSettings = JSON.parse(settingsStr);
  }
} catch (e) {
  console.warn("Error reading ssp_settings on boot", e);
}

export const BUSINESS_CONFIG = {
  ...defaults,
  ...(storedSettings || {}),
  whatsappMessages: {
    general: "Hi Shiv Saya Properties! I'm interested.",
    propertyEnquiry: (title: string) => `Hi! I'm interested in: ${title}. Please share more details.`,
    consultation: "Hi! I'd love a free consultation.",
    investment: "Hi! I'd love to chat with your expert.",
  }
};
