export class ChangePasswordError extends Error {
  constructor() {
    super('Insert old password to change it.')
  }
}
