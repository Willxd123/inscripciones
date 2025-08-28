import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PrerequisitoService } from './prerequisito.service';
import { CreatePrerequisitoDto } from './dto/create-prerequisito.dto';
import { UpdatePrerequisitoDto } from './dto/update-prerequisito.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('prerequisito')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PrerequisitoController {
  constructor(private readonly preRequisitoService: PrerequisitoService) {}

  @Post()
  create(@Body() createPrerequisitoDto: CreatePrerequisitoDto) {
    return this.preRequisitoService.create(createPrerequisitoDto);
  }

  @Get()
  findAll() {
    return this.preRequisitoService.findAll();
  }

  @Get(':materiaId/:materiaRequeridaId')
  findOne(@Param('materiaId') materiaId: string, @Param('materiaRequeridaId') materiaRequeridaId: string) {
    return this.preRequisitoService.findOne(+materiaId, +materiaRequeridaId);
  }

  @Patch(':materiaId/:materiaRequeridaId')
  update(@Param('materiaId') materiaId: string, @Param('materiaRequeridaId') materiaRequeridaId: string, @Body() updatePrerequisitoDto: UpdatePrerequisitoDto) {
    return this.preRequisitoService.update(+materiaId, +materiaRequeridaId, updatePrerequisitoDto);
  }

  @Delete(':materiaId/:materiaRequeridaId')
  remove(@Param('materiaId') materiaId: string, @Param('materiaRequeridaId') materiaRequeridaId: string) {
    return this.preRequisitoService.remove(+materiaId, +materiaRequeridaId);
  }
}