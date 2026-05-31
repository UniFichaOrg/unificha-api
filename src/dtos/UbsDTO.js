export default class UbsDTO {
    static toResponse(ubs) {
        if (!ubs) return null;
        const { deletadoEm, ...safe } = ubs;
        return safe;
    }
    static toResponseArray(list) {
        return list.map(u => this.toResponse(u));
    }
}