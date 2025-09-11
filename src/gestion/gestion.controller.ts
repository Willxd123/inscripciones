import { GenericWrapperService } from './../queue/generic-wrapper.service';
import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GestionService } from './gestion.service';
import { CreateGestionDto } from './dto/create-gestion.dto';
import { UpdateGestionDto } from './dto/update-gestion.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('gestion')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class GestionController {
  private gestionWrapper: any;
    constructor(private readonly genericWrapperService: GenericWrapperService) {
      this.gestionWrapper = this.genericWrapperService.createServiceWrapper('gestion');
    }

  @Post()
  create(@Body() createGestionDto: CreateGestionDto) {
    return this.gestionWrapper.create(createGestionDto);
  }

  @Get()
  findAll() {
    return this.gestionWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gestionWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGestionDto: UpdateGestionDto) {
    return this.gestionWrapper.update(+id, updateGestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gestionWrapper.remove(+id);
  }
}
