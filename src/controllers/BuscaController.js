import prisma from '../config/prisma.js';

class BuscaController {
    async executar(req, res) {
        const { q, tipo = 'tudo' } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({ status: 'error', message: 'O termo de busca deve conter pelo menos 2 caracteres.' });
        }

        const resultados = { pacientes: [], fichas: [], ubs: [] };

        const promises = [];

        if (tipo === 'tudo' || tipo === 'paciente') {
            promises.push(
                prisma.usuario.findMany({
                    where: {
                        deletadoEm: null,
                        OR: [
                            { nomeCompleto: { contains: q, mode: 'insensitive' } },
                            { cpf: { contains: q } }
                        ]
                    },
                    take: 10
                }).then(res => resultados.pacientes = res.map(u => ({ id: u.id, nomeCompleto: u.nomeCompleto, cpf: u.cpf, municipio: u.municipio })))
            );
        }

        if (tipo === 'tudo' || tipo === 'ficha') {
            promises.push(
                prisma.ficha.findMany({
                    where: {
                        deletadoEm: null,
                        OR: [
                            { id: { contains: q } },
                            { usuario: { nomeCompleto: { contains: q, mode: 'insensitive' } } }
                        ]
                    },
                    include: { usuario: true, configuracaoAgenda: true },
                    take: 10
                }).then(res => resultados.fichas = res.map(f => ({
                    id: f.id,
                    status: f.status,
                    dataAtendimento: f.dataAtendimento,
                    especialidade: f.configuracaoAgenda.especialidade,
                    paciente: { nomeCompleto: f.usuario.nomeCompleto }
                })))
            );
        }

        if (tipo === 'tudo' || tipo === 'ubs') {
            promises.push(
                prisma.ubs.findMany({
                    where: {
                        deletadoEm: null,
                        nome: { contains: q, mode: 'insensitive' }
                    },
                    take: 10
                }).then(res => resultados.ubs = res.map(u => ({ id: u.id, nome: u.nome, municipio: u.municipio })))
            );
        }

        await Promise.all(promises);

        return res.status(200).json({ status: 'success', data: resultados });
    }
}

export default new BuscaController();