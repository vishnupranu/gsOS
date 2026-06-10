import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/v1/auth/github/callback',
      scope: ['user:email'],
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
      throw new Error('No email found in GitHub profile');
    }

    return this.authService.handleOAuthCallback('github', {
      id,
      email,
      name: displayName || 'GitHub User',
      avatar: photos?.[0]?.value,
    });
  }
}