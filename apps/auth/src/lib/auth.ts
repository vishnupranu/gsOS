import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { sendVerificationRequest, sendWelcomeEmail } from './email';

// Type definitions for Prisma includes
interface MembershipWithOrg {
  organization: {
    id: string;
    slug: string;
  };
  role: string;
}

interface OrgRoleWithDetails {
  organization: {
    id: string;
  };
  role: {
    id: string;
    name: string;
    permissions: string;
  };
}

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    
    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    
    // Email/Password authentication
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const hashedPassword = hashPassword(credentials.password);
        if (user.password !== hashedPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    
    // Email magic link
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM ?? 'noreply@example.com',
      sendVerificationRequest,
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/auth/welcome',
  },
  
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create organization for new users
      if (account?.type === 'oauth' && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { memberships: true },
        });

        if (!existingUser?.memberships.length) {
          // Create default organization for new OAuth users
          const slug = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
          await prisma.organization.create({
            data: {
              name: user.name ?? user.email.split('@')[0],
              slug,
              memberships: {
                create: {
                  userId: user.id,
                  role: 'OWNER',
                },
              },
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        
        // Fetch user's organizations and roles
        const memberships = await prisma.membership.findMany({
          where: { userId: user.id },
          include: {
            organization: true,
          },
        });
        
        token.organizations = (memberships as MembershipWithOrg[]).map((m) => ({
          id: m.organization.id,
          slug: m.organization.slug,
          role: m.role,
        }));
        
        // Fetch user's custom organization roles
        const orgRoles = await prisma.organizationUserRole.findMany({
          where: { userId: user.id },
          include: {
            role: true,
            organization: true,
          },
        });
        
        token.orgRoles = (orgRoles as OrgRoleWithDetails[]).map((r) => ({
          organizationId: r.organization.id,
          roleId: r.role.id,
          roleName: r.role.name,
          permissions: JSON.parse(r.role.permissions || '[]') as string[],
        }));
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizations = token.organizations as Array<{
          id: string;
          slug: string;
          role: string;
        }>;
        session.user.orgRoles = token.orgRoles as Array<{
          organizationId: string;
          roleId: string;
          roleName: string;
          permissions: string[];
        }>;
      }
      return session;
    },
  },
  
  events: {
    async createUser({ user }) {
      if (user.email) {
        await sendWelcomeEmail(user.email, user.name ?? 'User');
      }
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      organizations: Array<{
        id: string;
        slug: string;
        role: string;
      }>;
      orgRoles: Array<{
        organizationId: string;
        roleId: string;
        roleName: string;
        permissions: string[];
      }>;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    organizations: Array<{
      id: string;
      slug: string;
      role: string;
    }>;
    orgRoles: Array<{
      organizationId: string;
      roleId: string;
      roleName: string;
      permissions: string[];
    }>;
  }
}