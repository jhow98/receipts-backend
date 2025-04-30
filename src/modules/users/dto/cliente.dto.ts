import { ApiProperty } from '@nestjs/swagger';

export class ClienteDto {
  @ApiProperty({ example: 1, description: 'ID do cliente' })
  id: number;

  @ApiProperty({ example: 'João Silva', description: 'Nome do cliente' })
  nome: string;

  @ApiProperty({ example: 3500, description: 'Salário do cliente' })
  salario: number;

  @ApiProperty({ example: 120000, description: 'Valor da empresa' })
  valorEmpresa: number;
}
