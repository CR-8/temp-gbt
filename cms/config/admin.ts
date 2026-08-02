import type { Core } from '@strapi/strapi';

// Content types with a dedicated front-end route get a pathname here; return
// null for anything without one (author/category/tag are relations only) so
// the Preview button stays hidden for them.
function getPreviewPathname(uid: string, document: Record<string, unknown>): string | null {
  switch (uid) {
    case 'api::article.article':
      return document.slug ? `/blog/${document.slug}` : '/blog';
    case 'api::project.project':
      return `/projects/${document.id}`;
    case 'api::team-member.team-member':
      return `/team/${document.id}`;
    // Rendered as sections of the homepage rather than their own route.
    case 'api::about.about':
    case 'api::site-setting.site-setting':
    case 'api::achievement.achievement':
      return '/';
    default:
      return null;
  }
}

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET')!,
  },
  apiToken: {
    salt: env('API_TOKEN_SALT')!,
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT')!,
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY')!,
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: [env('CLIENT_URL')!],
      async handler(uid, { documentId, status }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const document = await strapi.documents(uid as any).findOne({ documentId });
        if (!document) return null;

        const pathname = getPreviewPathname(uid, document);
        if (!pathname) return null;

        const params = new URLSearchParams({
          url: pathname,
          secret: env('PREVIEW_SECRET')!,
          status: status ?? 'draft',
        });
        return `${env('CLIENT_URL')}/api/preview?${params}`;
      },
    },
  },
});

export default config;
