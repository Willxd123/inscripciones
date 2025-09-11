import { GenericWrapperService } from './../queue/generic-wrapper.service';
import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PeriodoService } from './periodo.service';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('periodo')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PeriodoController {
  private periodoWrapper: any;
    constructor(private readonly genericWrapperService: GenericWrapperService) {
      this.periodoWrapper =
        this.genericWrapperService.createServiceWrapper('nota');
    }
  @Post()
  create(@Body() createPeriodoDto: CreatePeriodoDto) {
    return this.periodoWrapper.create(createPeriodoDto);
  }

  @Get()
  findAll() {
    return this.periodoWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodoWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePeriodoDto: UpdatePeriodoDto) {
    return this.periodoWrapper.update(+id, updatePeriodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.periodoWrapper.remove(+id);
  }
}