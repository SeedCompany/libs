import type { SendMailOptions } from 'nodemailer';

export abstract class Transporter {
  abstract sendMail(msg: SendMailOptions): Promise<unknown>;
}
