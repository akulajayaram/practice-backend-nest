import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, dob } = createUserDto;

    return { username, email, password, dob };
    // const existingUser = await this.userRepository.findOne({
    //   where: [{ username }, { email }],
    // });

    // if (existingUser) {
    //   throw new ConflictException('Username or email already exists');
    // }

    // const _dob = new Date(dob);

    // const hashedPassword = await bcrypt.hash(password, 10);

    // const user = this.userRepository.create({
    //   ...createUserDto,
    //   dob: _dob,
    //   password: hashedPassword,
    // });

    // return this.userRepository.save(user);
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
