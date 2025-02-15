
import { AuthConfig } from 'src/auth/config/auth-config.type';
import { AppConfig } from './app-config.type';
import { MailConfig } from 'src/mail/config/mail-config.type';
import { GoogleConfig } from 'src/auth-google/config/google-config.type';
import { FacebookConfig } from '../auth-facebook/config/facebook-config.type';



/* import { AppleConfig } from '../auth-apple/config/apple-config.type';
import { DatabaseConfig } from '../database/config/database-config.type';
import { FileConfig } from '../files/config/file-config.type';
import { MailConfig } from '../mail/config/mail-config.type';
import { TwitterConfig } from '../auth-twitter/config/twitter-config.type'; */

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  mail: MailConfig;
  google: GoogleConfig;
  facebook: FacebookConfig;
  /* apple: AppleConfig;
  database: DatabaseConfig;
  file: FileConfig;
  twitter: TwitterConfig; */
};
