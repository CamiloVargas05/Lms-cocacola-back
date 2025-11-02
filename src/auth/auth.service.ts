import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Login
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name || 'empleado',
    };

    const access_token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name || 'empleado',
      },
    };
  }

  // Logout (stateless)
  async logout() {
    return { message: 'Logout successful (client must delete token)' };
  }
}