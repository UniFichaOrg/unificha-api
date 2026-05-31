export default class FichaDTO {
    static toResponse(ficha) {
        if (!ficha) return null;
        const { deletadoEm, auditoriaIp, auditoriaIdMaquina, ...safe } = ficha;
        return safe;
    }
    static toResponseArray(list) {
        return list.map(f => this.toResponse(f));
    }
}