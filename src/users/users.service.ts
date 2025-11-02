import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  // Crear usuario
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roleId, password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    let role: Role | null = null;
    if (roleId) {
      role = await this.rolesRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
    }

    const user = this.usersRepository.create({
      ...rest,
      password: hashedPassword,
      role: role ?? undefined, // ✅ evita error de tipo Role | null
    });

    return await this.usersRepository.save(user);
  }

  // Listar todos los usuarios
  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role'],
    });
  }

  // Buscar un usuario por ID
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Buscar usuario por email (para Auth)
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  // Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const { roleId, ...rest } = updateUserDto;

    if (roleId) {
      const role = await this.rolesRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
      user.role = role;
    }

    Object.assign(user, rest);
    return await this.usersRepository.save(user);
  }

  // Eliminar usuario
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}