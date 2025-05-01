import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica o usuário e retorna um token JWT' })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        summary: 'Exemplo de login',
        value: {
          login: 'JohnDoe',
          password: 'senha123',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Token JWT retornado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() body: LoginDto) {
    this.logger.log(`Tentando autenticar usuário: ${body.login}`);
    const user = await this.authService.validateUser(body.login, body.password);

    if (!user) {
      this.logger.warn(`Falha na autenticação para login: ${body.login}`);
      throw new UnauthorizedException('Login ou senha inválidos');
    }

    const token = await this.authService.login(user);
    this.logger.log(`Usuário autenticado com sucesso: ${body.login}`);
    return token;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Usuário autenticado' })
  getProfile(@Request() req) {
    this.logger.log(`Requisição de perfil do usuário: ${req.user.login}`);
    return req.user;
  }
}
