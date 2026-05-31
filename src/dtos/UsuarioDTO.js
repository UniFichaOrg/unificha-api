export default class UsuarioDTO {
  static toResponse(user) {
    if (!user) return null;
    
    const { senhaHash, deletadoEm, ...safeUser } = user;
    return safeUser;
  }

  static toResponseArray(users) {
    return users.map(user => this.toResponse(user));
  }
}