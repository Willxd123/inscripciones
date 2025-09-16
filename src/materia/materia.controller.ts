import { GenericWrapperService } from './../queue/generic-wrapper.service';
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
import { MateriaService } from './materia.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('materia')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MateriaController {
  private materiaWrapper: any;
  constructor(private readonly genericWrapperService: GenericWrapperService) {
    this.materiaWrapper =
      this.genericWrapperService.createServiceWrapper('materia');
  }
  @Post()
  create(@Body() createMateriaDto: CreateMateriaDto) {
    return this.materiaWrapper.create(createMateriaDto);
  }

  @Get()
  findAll() {
    return this.materiaWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materiaWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMateriaDto: UpdateMateriaDto) {
    return this.materiaWrapper.update(+id, updateMateriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materiaWrapper.remove(+id);
  }
}
