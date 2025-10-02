import { EnvolventeGenericaService } from './../cola/envolvente-generica.service';
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
   private inscripcionWrapper: any;
        constructor(private readonly envolventeGenericaService: EnvolventeGenericaService) {
          this.inscripcionWrapper =
            this.envolventeGenericaService.crearEnvolventeServicio('inscripcion');
        }
  @Post()
  create(@Body() createInscripcionDto: CreateInscripcionDto) {
    return this.inscripcionWrapper.create(createInscripcionDto);
  }

  @Get()
  findAll() {
    return this.inscripcionWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inscripcionWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInscripcionDto: UpdateInscripcionDto) {
    return this.inscripcionWrapper.update(+id, updateInscripcionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inscripcionWrapper.remove(+id);
  }
}