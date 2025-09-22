import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { NavigationService } from './navigation.service';

@Controller('user-navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post()
  async saveNavigation(@Body() navigationData: any) {
    return this.navigationService.saveNavigation(navigationData);
  }

  @Get(':userId')
  async getUserNavigation(@Param('userId') userId: string) {
    return this.navigationService.getUserNavigation(userId);
  }
}
