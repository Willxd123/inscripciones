import { GenericWrapperService } from './../queue/generic-wrapper.service';
import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DocenteService } from './docente.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('docente')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class DocenteController {
  private docenteWrapper: any;
  
    constructor(private readonly genericWrapperService: GenericWrapperService) {
    
      this.docenteWrapper = this.genericWrapperService.createServiceWrapper('docente');
    }

  @Post()
  create(@Body() createDocenteDto: CreateDocenteDto) {
    return this.docenteWrapper.create(createDocenteDto);
  }

  @Get()
  findAll() {
    return this.docenteWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.docenteWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocenteDto: UpdateDocenteDto) {
    return this.docenteWrapper.update(+id, updateDocenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docenteWrapper.remove(+id);
  }
}
