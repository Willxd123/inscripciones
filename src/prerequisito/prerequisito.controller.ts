import { GenericWrapperService } from './../queue/generic-wrapper.service';
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
  private prerequisitoWrapper: any;
    constructor(private readonly genericWrapperService: GenericWrapperService) {
      this.prerequisitoWrapper = this.genericWrapperService.createServiceWrapper('prerequisito');
    }
  @Post()
  create(@Body() createPrerequisitoDto: CreatePrerequisitoDto) {
    return this.prerequisitoWrapper.create(createPrerequisitoDto);
  }

  @Get()
  findAll() {
    return this.prerequisitoWrapper.findAll();
  }

  @Get(':materiaId/:materiaRequeridaId')
  findOne(@Param('materiaId') materiaId: string, @Param('materiaRequeridaId') materiaRequeridaId: string) {
    return this.prerequisitoWrapper.findOne(+materiaId, +materiaRequeridaId);
  }

  @Patch(':materiaId/:materiaRequeridaId')
  update(@Param('materiaId') materiaId: string, @Param('materiaRequeridaId') materiaRequeridaId: string, @Body() updatePrerequisitoDto: UpdatePrerequisitoDto) {
    return this.prerequisitoWrapper.update(+materiaId, +materiaRequeridaId, updatePrerequisitoDto);
  }

  @Delete(':materiaId/:materiaRequeridaId')
  remove(@Param('materiaId') materiaId: string, @Param('materiaRequeridaId') materiaRequeridaId: string) {
    return this.prerequisitoWrapper.remove(+materiaId, +materiaRequeridaId);
  }
}