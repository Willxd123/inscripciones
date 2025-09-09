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
import { CarreraWrapperService } from '../queue/carrera-wrapper.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('carrera')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CarreraController {
  constructor(private readonly carreraWrapperService: CarreraWrapperService) {}

  @Post()
  create(@Body() createCarreraDto: CreateCarreraDto) {
    return this.carreraWrapperService.create(createCarreraDto);
  }

  @Get()
  findAll() {
    return this.carreraWrapperService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carreraWrapperService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarreraDto: UpdateCarreraDto) {
    return this.carreraWrapperService.update(+id, updateCarreraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carreraWrapperService.remove(+id);
  }
}