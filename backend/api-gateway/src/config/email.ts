import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// Create email transporter
export const emailTransporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  } : undefined,
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
  }>;
}

export interface EmailService {
  sendEmail: (options: EmailOptions) => Promise<void>;
  sendVerificationEmail: (to: string, token: string) => Promise<void>;
  sendPasswordResetEmail: (to: string, token: string) => Promise<void>;
  sendCaseAssignmentEmail: (to: string, caseId: string, caseTitle: string) => Promise<void>;
}

export const emailService: EmailService = {
  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, html, text, attachments } = options;

    try {
      const info = await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'Legal Aid Platform <noreply@lehelp.org>',
        to,
        subject,
        html,
        text,
        attachments,
      });

      logger.info(`Email sent: ${info.messageId}`);
      
      // In development with MailHog, log preview URL
      if (process.env.NODE_ENV === 'development' && process.env.SMTP_HOST === 'localhost') {
        logger.info(`Preview URL: http://localhost:8025`);
      }
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  },

  /**
   * Send email verification
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.CORS_ORIGIN?.split(',')[0]}/verify-email?token=${token}`;
    
    await this.sendEmail({
      to,
      subject: 'Verify Your Email - Legal Aid Platform',
      html: `
        <h2>Welcome to Legal Aid Platform</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
      text: `Welcome to Legal Aid Platform. Verify your email: ${verificationUrl}`,
    });
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.CORS_ORIGIN?.split(',')[0]}/reset-password?token=${token}`;
    
    await this.sendEmail({
      to,
      subject: 'Password Reset - Legal Aid Platform',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Password reset link: ${resetUrl}`,
    });
  },

  /**
   * Send case assignment notification
   */
  async sendCaseAssignmentEmail(to: string, caseId: string, caseTitle: string): Promise<void> {
    const caseUrl = `${process.env.CORS_ORIGIN?.split(',')[0]}/cases/${caseId}`;
    
    await this.sendEmail({
      to,
      subject: 'New Case Assignment - Legal Aid Platform',
      html: `
        <h2>New Case Assigned</h2>
        <p>You have been assigned to a new case:</p>
        <p><strong>${caseTitle}</strong></p>
        <p><a href="${caseUrl}">View Case</a></p>
      `,
      text: `New case assigned: ${caseTitle}. View at: ${caseUrl}`,
    });
  },
};
