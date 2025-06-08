import { PaymentMethod } from "../../entities/Order";
export interface PaymentStrategy {
  processPayment(amount: number, paymentData: any): Promise<PaymentResult>;
  validatePaymentData(paymentData: any): boolean;
  getPaymentMethod(): PaymentMethod;
}
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  processingTime?: number;
}
export class CreditCardPaymentStrategy implements PaymentStrategy {
  getPaymentMethod(): PaymentMethod {
    return PaymentMethod.CREDIT_CARD;
  }
  validatePaymentData(paymentData: any): boolean {
    const { cardNumber, expiryDate, cvv, cardholderName } = paymentData;
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      return false;
    }
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
      return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      return false;
    }
    const [month, year] = expiryDate.split("/");
    const currentDate = new Date();
    const expiryDateObj = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiryDateObj <= currentDate) {
      return false;
    }
    return true;
  }
  async processPayment(
    amount: number,
    paymentData: any
  ): Promise<PaymentResult> {
    if (!this.validatePaymentData(paymentData)) {
      return {
        success: false,
        errorMessage: "Invalid credit card data",
      };
    }
    const startTime = Date.now();
    try {
      if (Math.random() < 0.05) {
        throw new Error("Payment declined by bank");
      }
      const processingTime = Date.now() - startTime;
      return {
        success: true,
        transactionId: `cc_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        processingTime,
      };
    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }
}
export class PixPaymentStrategy implements PaymentStrategy {
  getPaymentMethod(): PaymentMethod {
    return PaymentMethod.PIX;
  }
  validatePaymentData(paymentData: any): boolean {
    const { pixKey, userDocument } = paymentData;
    if (!pixKey || !userDocument) {
      return false;
    }
    const pixKeyRegex =
      /^[\w.-]+@[\w.-]+\.\w+$|^\d{11}$|^\d{14}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!pixKeyRegex.test(pixKey)) {
      return false;
    }
    return true;
  }
  async processPayment(
    amount: number,
    paymentData: any
  ): Promise<PaymentResult> {
    if (!this.validatePaymentData(paymentData)) {
      return {
        success: false,
        errorMessage: "Invalid PIX data",
      };
    }
    const startTime = Date.now();
    try {
      if (Math.random() < 0.01) {
        throw new Error("PIX key not found or inactive");
      }
      const processingTime = Date.now() - startTime;
      return {
        success: true,
        transactionId: `pix_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        processingTime,
      };
    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }
}
export class BoletoPaymentStrategy implements PaymentStrategy {
  getPaymentMethod(): PaymentMethod {
    return PaymentMethod.BOLETO;
  }
  validatePaymentData(paymentData: any): boolean {
    const { userDocument, userName, userAddress } = paymentData;
    if (!userDocument || !userName || !userAddress) {
      return false;
    }
    const cleanDocument = userDocument.replace(/\D/g, "");
    if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      return false;
    }
    return true;
  }
  async processPayment(
    amount: number,
    paymentData: any
  ): Promise<PaymentResult> {
    if (!this.validatePaymentData(paymentData)) {
      return {
        success: false,
        errorMessage: "Invalid boleto data",
      };
    }
    const startTime = Date.now();
    try {
      const processingTime = Date.now() - startTime;
      return {
        success: true,
        transactionId: `boleto_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        processingTime,
      };
    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }
}
export class PaymentProcessor {
  private strategy: PaymentStrategy;
  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }
  public setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }
  public async processPayment(
    amount: number,
    paymentData: any
  ): Promise<PaymentResult> {
    return await this.strategy.processPayment(amount, paymentData);
  }
  public validatePaymentData(paymentData: any): boolean {
    return this.strategy.validatePaymentData(paymentData);
  }
  public getPaymentMethod(): PaymentMethod {
    return this.strategy.getPaymentMethod();
  }
}
export class PaymentStrategyFactory {
  static createStrategy(paymentMethod: PaymentMethod): PaymentStrategy {
    switch (paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        return new CreditCardPaymentStrategy();
      case PaymentMethod.PIX:
        return new PixPaymentStrategy();
      case PaymentMethod.BOLETO:
        return new BoletoPaymentStrategy();
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  }
}
