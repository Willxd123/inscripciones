import { GenericWrapperService } from './../queue/generic-wrapper.service';
import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GrupoMateriaService } from './grupo-materia.service';
import { CreateGrupoMateriaDto } from './dto/create-grupo-materia.dto';
import { UpdateGrupoMateriaDto } from './dto/update-grupo-materia.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('grupo-materia')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class GrupoMateriaController {
  private grupoMateriaWrapper: any;
    constructor(private readonly genericWrapperService: GenericWrapperService) {
      this.grupoMateriaWrapper =
        this.genericWrapperService.createServiceWrapper('grupo-materia');
    }
  
  @Post()
  create(@Body() createGrupoMateriaDto: CreateGrupoMateriaDto) {
    return this.grupoMateriaWrapper.create(createGrupoMateriaDto);
  }

  @Get()
  findAll() {
    return this.grupoMateriaWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.grupoMateriaWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGrupoMateriaDto: UpdateGrupoMateriaDto) {
    return this.grupoMateriaWrapper.update(+id, updateGrupoMateriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.grupoMateriaWrapper.remove(+id);
  }
}
