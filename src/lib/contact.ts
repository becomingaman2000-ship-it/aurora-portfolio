export const CONTACT_EMAIL = "eustacemadawu1@gmail.com";

/** Gmail compose URL with my address pre-selected as the recipient. */
export function gmailCompose(subject = "", body = "") {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: CONTACT_EMAIL,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export const GMAIL_COMPOSE = gmailCompose("Enquiry from your website");
