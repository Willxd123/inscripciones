import { GenericWrapperService } from './../queue/generic-wrapper.service';
import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ModuloService } from './modulo.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('modulo')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ModuloController {
   private moduloWrapper: any;
    constructor(private readonly genericWrapperService: GenericWrapperService) {
      this.moduloWrapper =
        this.genericWrapperService.createServiceWrapper('modulo');
    }
  @Post()
  create(@Body() createModuloDto: CreateModuloDto) {
    return this.moduloWrapper.create(createModuloDto);
  }

  @Get()
  findAll() {
    return this.moduloWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduloWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModuloDto: UpdateModuloDto) {
    return this.moduloWrapper.update(+id, updateModuloDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduloWrapper.remove(+id);
  }
}