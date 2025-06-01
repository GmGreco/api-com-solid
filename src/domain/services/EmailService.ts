export interface EmailData {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface EmailService {
  sendEmail(emailData: EmailData): Promise<void>;
}
