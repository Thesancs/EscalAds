import type {FastifyInstance} from 'fastify';

export async function registerExtensionRoutes(app: FastifyInstance) {
  app.get('/releases/latest', {preHandler: [app.authenticate]}, async (request, reply) => {
    const query = request.query as {channel?: 'STABLE' | 'BETA' | 'CANARY'} | undefined;
    const channel = query?.channel ?? 'STABLE';

    const {data, error} = await app.supabase
      .from('extension_releases')
      .select('version, channel, package_url, checksum, notes, created_at')
      .eq('channel', channel)
      .order('created_at', {ascending: false})
      .limit(1)
      .maybeSingle();

    if (error) {
      request.log.error({error}, 'Failed to fetch latest extension release');
      throw app.httpErrors.internalServerError('Unable to fetch extension release');
    }

    if (!data) {
      return reply.notFound('No extension release available');
    }

    return {
      version: data.version,
      channel: data.channel,
      packageUrl: data.package_url,
      checksum: data.checksum,
      notes: data.notes,
      createdAt: data.created_at
    };
  });
}
