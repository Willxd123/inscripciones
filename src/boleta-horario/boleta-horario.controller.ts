import { EnvolventeGenericaService } from './../cola/envolvente-generica.service';
import { AuthGuard } from './../auth/guard/auth.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BoletaHorarioService } from './boleta-horario.service';
import { CreateBoletaHorarioDto } from './dto/create-boleta-horario.dto';
import { UpdateBoletaHorarioDto } from './dto/update-boleta-horario.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('boleta-horario')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BoletaHorarioController {
  private boletaHorarioWrapper: any;

  constructor(private readonly envolventeGenericaService: EnvolventeGenericaService) {
    this.boletaHorarioWrapper =
      this.envolventeGenericaService.crearEnvolventeServicio('boleta-horario');
  }
  @Post()
  create(@Body() createBoletaHorarioDto: CreateBoletaHorarioDto) {
    return this.boletaHorarioWrapper.create(createBoletaHorarioDto);
  }

  @Get()
  findAll() {
    return this.boletaHorarioWrapper.findAll();
  }

  @Get(':grupoMateriaId/:horarioId')
  findOne(
    @Param('grupoMateriaId') grupoMateriaId: string,
    @Param('horarioId') horarioId: string,
  ) {
    return this.boletaHorarioWrapper.findOne(+grupoMateriaId, +horarioId);
  }

  @Patch(':grupoMateriaId/:horarioId')
  update(
    @Param('grupoMateriaId') grupoMateriaId: string,
    @Param('horarioId') horarioId: string,
    @Body() updateBoletaHorarioDto: UpdateBoletaHorarioDto,
  ) {
    return this.boletaHorarioWrapper.update(
      +grupoMateriaId,
      +horarioId,
      updateBoletaHorarioDto,
    );
  }

  @Delete(':grupoMateriaId/:horarioId')
  remove(
    @Param('grupoMateriaId') grupoMateriaId: string,
    @Param('horarioId') horarioId: string,
  ) {
    return this.boletaHorarioWrapper.remove(+grupoMateriaId, +horarioId);
  }
}
