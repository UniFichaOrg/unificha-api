export default class ProfissionalDTO {
    static toResponse(profissional) {
        if (!profissional) return null;

        const { deletadoEm, ubs, ...safeData } = profissional;

        return {
            ...safeData,
            ubs: ubs ? ubs.map(link => ({
                id: link.ubs.id,
                nome: link.ubs.nome,
                municipio: link.ubs.municipio
            })) : []
        };
    }

    static toResponseArray(list) {
        return list.map(p => this.toResponse(p));
    }
}