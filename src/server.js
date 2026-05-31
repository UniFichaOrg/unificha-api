import app from './app.js';
import { createSuperAdminIfNotExists } from './utils/seedAdmin.js';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    await createSuperAdminIfNotExists();

    app.listen(PORT, () => {
        console.log(`🚀 UniFicha API rodando na porta ${PORT}`);
    });
}

bootstrap();