import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AppLogger } from '../../../common/logger/logger.service';
import { UserResponseDto } from '../dto/user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: AppLogger,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiBody({ type: UserDto })
  async create(@Body() createUserDto: UserDto): Promise<UserResponseDto> {
    this.logger.log(`Recebida requisição para criar usuário: ${JSON.stringify(createUserDto)}`);
    const result = await this.userService.create(createUserDto);
    this.logger.log(`Usuário criado com sucesso: ${JSON.stringify(result)}`);
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async findAll(): Promise<User[]> {
    this.logger.log('Listando todos os usuários');
    return await this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: number): Promise<User> {
    this.logger.log(`Buscando usuário com ID ${id}`);
    return await this.userService.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: number): Promise<void> {
    this.logger.log(`Solicitação para deletar usuário com ID ${id}`);
    return await this.userService.delete(id);
  }
}
