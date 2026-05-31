export default class AgendaDTO {
    static toResponse(agenda) {
        if (!agenda) return null;
        const { deletadoEm, ...safe } = agenda;
        return safe;
    }
    static toResponseArray(list) {
        return list.map(a => this.toResponse(a));
    }
}