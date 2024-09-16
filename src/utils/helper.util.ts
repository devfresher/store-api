import speakeasy from 'speakeasy';
import serverConfig from '@src/config/server.config';

class HelperUtil {
  public getLabel(name: string): string {
    const label = name.replace(/([^\w ]|_)/g, '');
    return `${label.replace(/\s+/g, '-').toLowerCase()}`;
  }

  public generateOtp() {
    return speakeasy.totp({
      secret: serverConfig.TOTP_SECRET_KEY,
      encoding: 'base32',
    });
  }

  public verifyOtp(token: string, window = 5) {
    return speakeasy.totp.verify({
      secret: serverConfig.TOTP_SECRET_KEY,
      encoding: 'base32',
      token,
      window,
    });
  }
}

export default new HelperUtil();
