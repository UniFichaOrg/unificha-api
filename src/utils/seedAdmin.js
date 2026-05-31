import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

export async function createSuperAdminIfNotExists() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@unificha.org';

    const adminExists = await prisma.usuario.findFirst({
        where: { login: 'admin' },
    });

    if (!adminExists) {
        const senhaHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);

        await prisma.usuario.create({
            data: {
                nomeCompleto: 'Super Administrador',
                login: 'admin',
                email: adminEmail,
                senhaHash,
                perfil: 'ADMIN',
                cpf: '00000000000',
                cns: '000000000000000',
                municipio: 'Sistema',
                bairro: 'Sistema',
                logradouro: 'Sistema',
                cep: '00000000',
                uf: 'RN'
            },
        });
        console.log('✅ Super Administrador criado com sucesso.');
    }
}