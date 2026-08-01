import type { Core } from '@strapi/strapi';

// Content is meant to be publicly readable (marketing site), so grant the
// public role read access on boot instead of requiring a manual admin click.
const PUBLIC_READ_PERMISSIONS: Record<string, string[]> = {
  article: ['find', 'findOne'],
  category: ['find', 'findOne'],
  tag: ['find', 'findOne'],
  author: ['find', 'findOne'],
  'site-setting': ['find'],
  about: ['find'],
  project: ['find', 'findOne'],
  achievement: ['find', 'findOne'],
  'team-member': ['find', 'findOne'],
};

async function grantPublicReadPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) return;

  const existingPermissions = await strapi
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: publicRole.id } });

  const existingActions = new Set(existingPermissions.map((p) => p.action));

  const permissionsToCreate = Object.entries(PUBLIC_READ_PERMISSIONS).flatMap(
    ([controller, actions]) =>
      actions
        .map((action) => `api::${controller}.${controller}.${action}`)
        .filter((action) => !existingActions.has(action))
  );

  if (permissionsToCreate.length === 0) return;

  await Promise.all(
    permissionsToCreate.map((action) =>
      strapi.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      })
    )
  );

  strapi.log.info(
    `[bootstrap] Granted public read access: ${permissionsToCreate.join(', ')}`
  );
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicReadPermissions(strapi);
  },
};
