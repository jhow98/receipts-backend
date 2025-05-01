import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario.e2e.123456' })
  @IsString()
  login: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  password: string;
}
