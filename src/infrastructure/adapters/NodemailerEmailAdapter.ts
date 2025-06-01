import { EmailService, EmailData } from "../../domain/services/EmailService";

export class NodemailerEmailAdapter implements EmailService {
  private transporter: any;

  constructor(config: any) {
    // Configuração do Nodemailer seria feita aqui
    this.transporter = config;
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      // Implementação específica do Nodemailer
      console.log(`Sending email via Nodemailer to: ${emailData.to}`);
      console.log(`Subject: ${emailData.subject}`);
      // await this.transporter.sendMail(emailData);
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`);
    }
  }
}

export class SendGridEmailAdapter implements EmailService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      // Implementação específica do SendGrid
      console.log(`Sending email via SendGrid to: ${emailData.to}`);
      console.log(`Subject: ${emailData.subject}`);
      // Implementação real do SendGrid aqui
    } catch (error) {
      throw new Error(`Failed to send email via SendGrid: ${error}`);
    }
  }
}
