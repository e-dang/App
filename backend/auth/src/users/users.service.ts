import {PasswordHasherService} from "@password-hasher/password-hasher.service";
import {ConflictException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DeepPartial, FindConditions, Repository} from "typeorm";
import {Role} from "@core/types";
import {UpdateUserDto} from "./dto/update-user.dto";
import {User} from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async create(payload: DeepPartial<User>) {
    if (await this.exists({email: payload.email})) {
      throw new ConflictException();
    }

    const user = this.userRepository.create({
      ...payload,
      role: Role.User,
      lastLogin: new Date(),
      password: this.passwordHasher.hashPassword(payload.password),
    });

    return this.userRepository.save(user);
  }

  async exists(criteria: FindConditions<User>) {
    return (await this.userRepository.findOne(criteria, {select: ["id"], withDeleted: true})) !== undefined;
  }

  find() {
    return this.userRepository.find();
  }

  findOne(criteria: FindConditions<User>) {
    return this.userRepository.findOne(criteria);
  }

  async findOneOrFail(criteria: FindConditions<User>) {
    const user = await this.userRepository.findOne(criteria);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async update(user: User, payload: UpdateUserDto) {
    await this.userRepository.update(user.id, payload);
    return this.userRepository.findOne(user.id);
  }

  async updateLastLogin(criteria: string | FindConditions<User>) {
    await this.userRepository.update(criteria, {lastLogin: new Date()});
  }

  async incrementTokenVersion(criteria: FindConditions<User>) {
    await this.userRepository.increment(criteria, "tokenVersion", 1);
  }

  async updatePassword(criteria: string | FindConditions<User>, password: string) {
    await this.userRepository.update(criteria, {password: this.passwordHasher.hashPassword(password)});
  }

  async remove(user: User) {
    await this.userRepository.softDelete(user.id);
  }
}
