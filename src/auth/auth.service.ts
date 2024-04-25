import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { AuthCredentialsDto } from './dto/auth.credentials.dto';

@Injectable()
export class AuthService {
  constructor(private usersRepository: UserRepository) {}

  async signUp(authDto: AuthCredentialsDto): Promise<void> {
    return this.usersRepository.createUser(authDto);
  }

  async signIn(
    authDto: AuthCredentialsDto,
  ): Promise<{ token: string; username: string }> {
    return this.usersRepository.signIn(authDto);
  }
}
