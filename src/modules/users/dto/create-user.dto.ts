import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the user',
  })
  name: string;

  @ApiProperty({
    example: 'john.doe',
    description: 'Login used by the user',
  })
  login: string;

  @ApiProperty({
    example: '123456',
    description: 'Password for the user',
  })
  password: string;
}
