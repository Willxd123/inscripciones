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
import { GenericWrapperService } from '../queue/generic-wrapper.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('carrera')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CarreraController {
  private carreraWrapper: any;

  constructor(private readonly genericWrapperService: GenericWrapperService) {
    // Crear wrapper específico para carrera usando el factory genérico
    this.carreraWrapper = this.genericWrapperService.createServiceWrapper('carrera');
  }

  @Post()
  create(@Body() createCarreraDto: CreateCarreraDto) {
    return this.carreraWrapper.create(createCarreraDto);
  }

  @Get()
  findAll() {
    return this.carreraWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carreraWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarreraDto: UpdateCarreraDto) {
    return this.carreraWrapper.update(+id, updateCarreraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carreraWrapper.remove(+id);
  }
}