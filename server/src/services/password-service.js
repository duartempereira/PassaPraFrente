import UserRepository from '../repositories/user-repository.js'
import { generatePassword, hashPassword } from '../utils/password.js'

class PasswordService {
  static async generateAndStoreNewPassword (id) {
    const newPassword = generatePassword()

    const hashedPassword = await hashPassword(newPassword)

    await UserRepository.updateUserPassword(id, hashedPassword)

    return newPassword
  }
}

export default PasswordService
