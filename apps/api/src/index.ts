import {env} from './env';
import {buildServer} from './server';

async function bootstrap() {
  const app = await buildServer();

  try {
    await app.listen({port: env.PORT, host: '0.0.0.0'});
    app.log.info(`EscalAds API running on port ${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

bootstrap();
