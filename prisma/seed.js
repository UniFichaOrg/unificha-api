import prisma from '../src/config/prisma.js';
import bcrypt from 'bcrypt';

async function main() {
    console.log('🌱 Iniciando o semeio do banco de dados (Seed) - Contexto: RN...');

    console.log('└─ Limpando tabelas antigas...');
    try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "fichas", "profissional_ubs", "profissionais", "configuracoes_agenda", "ubs", "usuarios" CASCADE;`);
    } catch (error) {
        // Ignora se o banco já estiver limpo
    }

    const senhaHashPadrao = await bcrypt.hash('UniFicha@2026', 10);

    console.log('└─ Criando usuários do sistema...');

    const admin = await prisma.usuario.create({
        data: {
            nomeCompleto: 'Super Administrador',
            login: 'admin',
            email: 'admin@unificha.rn.gov.br',
            senhaHash: senhaHashPadrao,
            perfis: ['ADMIN'],
            cpf: '00000000000',
            cns: '000000000000000',
            logradouro: 'Centro Administrativo do Estado',
            bairro: 'Lagoa Nova',
            cep: '59064901',
            municipio: 'Natal',
            uf: 'RN'
        }
    });

    const gestorNatal = await prisma.usuario.create({
        data: {
            nomeCompleto: 'Mariana Costa Sousa',
            login: 'mariana.gestora',
            email: 'mariana.ubs@natal.rn.gov.br',
            senhaHash: senhaHashPadrao,
            perfis: ['GESTOR'],
            cpf: '11122233344',
            cns: '111111111111111',
            logradouro: 'Av. Hermes da Fonseca, 450',
            bairro: 'Tirol',
            cep: '59020000',
            municipio: 'Natal',
            uf: 'RN'
        }
    });

    const agenteTriagem = await prisma.usuario.create({
        data: {
            nomeCompleto: 'Ricardo Alves Melo',
            login: 'ricardo.agente',
            email: 'ricardo.agente@natal.rn.gov.br',
            senhaHash: senhaHashPadrao,
            perfis: ['AGENTE'],
            cpf: '55566677788',
            cns: '222222222222222',
            logradouro: 'Rua São João, 12',
            bairro: 'Rocas',
            cep: '59010050',
            municipio: 'Natal',
            uf: 'RN'
        }
    });

    const cidadaoNatal = await prisma.usuario.create({
        data: {
            nomeCompleto: 'João Maria da Silva',
            login: 'joao.maria',
            email: 'joaomaria.natal@gmail.com',
            senhaHash: senhaHashPadrao,
            perfis: ['CIDADAO'],
            cpf: '99988877766',
            cns: '777777777777777',
            logradouro: 'Rua Trairi, 104',
            bairro: 'Petrópolis',
            cep: '59020150',
            municipio: 'Natal',
            uf: 'RN',
            idMaquina: 'MAC-DESKTOP-JOAO-2026'
        }
    });

    console.log('└─ Criando Unidades Básicas de Saúde (UBS)...');

    const ubsBrasiliaTeimosa = await prisma.ubs.create({
        data: {
            nome: 'UBS Brasília Teimosa',
            bairro: 'Santos Reis',
            municipio: 'Natal',
            latitude: -5.757312,
            longitude: -35.193214,
            politicaAtendimento: 'MUNICIPAL',
            filaPausada: false
        }
    });

    console.log('└─ Criando configurações de agenda...');

    const agendaClinicoBrasilia = await prisma.configuracaoAgenda.create({
        data: {
            idUbs: ubsBrasiliaTeimosa.id,
            especialidade: 'Clínica Geral',
            horarioAbertura: '07:00',
            horarioFechamento: '12:00',
            cotaGeral: 15,
            cotaPrioritaria: 5,
            limiteFichasPorCidadao: 3
        }
    });

    console.log('└─ Cadastrando profissionais e vínculos...');

    await prisma.profissional.create({
        data: {
            nome: 'Dr. Marcos Potter de Moura',
            especialidade: 'Clínica Geral',
            area: 'Medicina',
            registro: 'CRM-RN 8745',
            ativo: true,
            ubs: {
                create: [
                    { idUbs: ubsBrasiliaTeimosa.id }
                ]
            }
        }
    });

    console.log('└─ Semeando fichas de atendimento...');

    const hoje = new Date();

    const horaInicio1 = new Date(hoje); horaInicio1.setHours(7, 15, 0, 0);
    const horaFim1 = new Date(hoje); horaFim1.setHours(7, 30, 0, 0);
    await prisma.ficha.create({
        data: {
            idUsuario: cidadaoNatal.id,
            idConfiguracaoAgenda: agendaClinicoBrasilia.id,
            dataAtendimento: horaInicio1,
            tipo: 'NORMAL',
            status: 'CONCLUIDA',
            iniciadoEm: horaInicio1,
            finalizadoEm: horaFim1,
            observacao: 'Paciente examinado, quadro estável.',
            auditoriaIp: '192.168.1.50'
        }
    });

    console.log('✅ Banco de dados semeado com sucesso completo para a V2.0!');
}

main()
    .catch((e) => {
        console.error('❌ Erro executando o seed script:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });