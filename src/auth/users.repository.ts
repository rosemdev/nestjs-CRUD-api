import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth.credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.payload.interface';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(authDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authDto;

    //hash
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt);

    const user = this.create({ username, password: hashedPass });

    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('The username should be unique!');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(
    authDto: AuthCredentialsDto,
  ): Promise<{ token: string; username: string }> {
    const { username, password } = authDto;
    const user = await this.findOne({ where: { username: username } });

    if (!user) {
      throw new UnauthorizedException('Please check your login credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Please check your login credentials');
    }

    const payload: JwtPayload = { username };
    const token = await this.jwtService.sign(payload);

    return { username, token };
  }
}
