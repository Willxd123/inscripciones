import { EnvolventeGenericaService } from './../cola/envolvente-generica.service';
import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HorarioService } from './horario.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('horario')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class HorarioController {
  private horarioWrapper: any;
      constructor(private readonly envolventeGenericaService: EnvolventeGenericaService) {
        this.horarioWrapper =
          this.envolventeGenericaService.crearEnvolventeServicio('horario');
      }
    
  @Post()
  create(@Body() createHorarioDto: CreateHorarioDto) {
    return this.horarioWrapper.create(createHorarioDto);
  }

  @Get()
  findAll() {
    return this.horarioWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.horarioWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHorarioDto: UpdateHorarioDto) {
    return this.horarioWrapper.update(+id, updateHorarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.horarioWrapper.remove(+id);
  }
}
