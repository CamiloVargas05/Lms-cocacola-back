import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/roles/entities/role.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto, ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
  private transporter;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {

    // 🔥 LOGS PARA VER SI RAILWAY ESTÁ LEYENDO VARIABLES
    console.log("===== VARIABLES DE CORREO DESDE RAILWAY =====");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // ========================
  //   CREAR USUARIO
  // ========================
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
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
      role: role ?? undefined,
      points: 0,
    });

    const savedUser = await this.usersRepository.save(user);
    const { password: _, ...userWithoutPassword } = savedUser;

    return userWithoutPassword;
  }

  // ========================
  //   LISTAR USUARIOS
  // ========================
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find({ relations: ['role'] });
    return users.map(({ password, ...rest }) => rest);
  }

  // ========================
  //   BUSCAR POR ID
  // ========================
  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) throw new NotFoundException('User not found');

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ========================
  //   BUSCAR POR EMAIL
  // ========================
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  // ========================
  //   FORGOT PASSWORD
  // ========================
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.findByEmail(forgotPasswordDto.email);

    if (!user) {
      throw new NotFoundException('Este email no está registrado');
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar hash y expiración
    const hashedCode = await bcrypt.hash(code, 10);
    await this.usersRepository.update(user.id, {
      resetPasswordCode: hashedCode,
      resetPasswordExpires: new Date(Date.now() + 15 * 60000),
    });

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Código de recuperación de contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Recuperación de Contraseña</h2>
            <p>Hola ${user.name},</p>
            <p>Tu código de recuperación es:</p>
            <div style="background:#f3f3f3;padding:20px;text-align:center;font-size:30px;font-weight:bold;letter-spacing:5px;">
              ${code}
            </div>
            <p>Este código expirará en 15 minutos.</p>
          </div>
        `,
      });

      return { message: 'Código enviado a tu correo' };
    } catch (error) {
      throw new BadRequestException('Error al enviar el correo');
    }
  }

  // ========================
  //   VERIFICAR CÓDIGO
  // ========================
  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    const { email, code } = verifyCodeDto;
    const user = await this.findByEmail(email);

    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('El código ha expirado');
    }

    const isValid = await bcrypt.compare(code, user.resetPasswordCode);

    if (!isValid) {
      throw new BadRequestException('Código incorrecto');
    }

    return { message: 'Código correcto', valid: true };
  }

  // ========================
  //   RESET PASSWORD
  // ========================
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const user = await this.findByEmail(email);

    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('El código ha expirado');
    }

    const isValid = await bcrypt.compare(code, user.resetPasswordCode);

    if (!isValid) {
      throw new BadRequestException('Código incorrecto');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordCode: null,
      resetPasswordExpires: null,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  // ========================
  //   ACTUALIZAR USUARIO
  // ========================
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) throw new NotFoundException('User not found');

    const { roleId, password, activo, points, ...rest } = updateUserDto;

    if (roleId) {
      const role = await this.rolesRepository.findOne({
        where: { id: roleId },
      });
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
      user.role = role;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (activo !== undefined) user.activo = activo;
    if (points !== undefined) user.points = points;

    Object.assign(user, rest);

    const updatedUser = await this.usersRepository.save(user);
    const { password: _, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }

  // ========================
  //   ELIMINAR USUARIO
  // ========================
  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.remove(user);
  }
}