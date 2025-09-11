import { GenericWrapperService } from './../queue/generic-wrapper.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DetalleInscripcionService } from './detalle-inscripcion.service';
import { CreateDetalleInscripcionDto } from './dto/create-detalle-inscripcion.dto';
import { UpdateDetalleInscripcionDto } from './dto/update-detalle-inscripcion.dto';

@Controller('detalle-inscripcion')
export class DetalleInscripcionController {
  private detalleInscripcionWrapper: any;

  constructor(private readonly genericWrapperService: GenericWrapperService) {
    this.detalleInscripcionWrapper =
      this.genericWrapperService.createServiceWrapper('detalle-inscripcion');
  }
  @Post()
  create(@Body() createDetalleInscripcionDto: CreateDetalleInscripcionDto) {
    return this.detalleInscripcionWrapper.create(createDetalleInscripcionDto);
  }

  @Get()
  findAll() {
    return this.detalleInscripcionWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleInscripcionWrapper.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDetalleInscripcionDto: UpdateDetalleInscripcionDto,
  ) {
    return this.detalleInscripcionWrapper.update(
      +id,
      updateDetalleInscripcionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleInscripcionWrapper.remove(+id);
  }
}
