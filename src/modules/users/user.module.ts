import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user.repository';
import { MetricsModule } from '../../common/metrics/metrics.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MetricsModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}

