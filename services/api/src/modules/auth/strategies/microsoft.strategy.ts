import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { AuthService } from '../auth.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || '/api/v1/auth/microsoft/callback',
      scope: ['user.read', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
  ) {
    const { id, displayName, emails, photos } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new Error('No email found in Microsoft profile');
    }

    return this.authService.handleOAuthCallback('microsoft', {
      id,
      email,
      name: displayName || 'Microsoft User',
      avatar: photos?.[0]?.value,
    });
  }
}