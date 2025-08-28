import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('inscripcion')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class InscripcionController {
  constructor(private readonly inscripcionService: InscripcionService) {}

  @Post()
  create(@Body() createInscripcionDto: CreateInscripcionDto) {
    return this.inscripcionService.create(createInscripcionDto);
  }

  @Get()
  findAll() {
    return this.inscripcionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inscripcionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInscripcionDto: UpdateInscripcionDto) {
    return this.inscripcionService.update(+id, updateInscripcionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inscripcionService.remove(+id);
  }
}