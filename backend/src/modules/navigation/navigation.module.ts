import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';
import { UserNavigation } from './navigation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserNavigation])],
  controllers: [NavigationController],
  providers: [NavigationService],
  exports: [NavigationService],
})
export class NavigationModule {}
