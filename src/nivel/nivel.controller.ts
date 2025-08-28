import { AuthGuard } from './../auth/guard/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NivelService } from './nivel.service';
import { CreateNivelDto } from './dto/create-nivel.dto';
import { UpdateNivelDto } from './dto/update-nivel.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('nivel')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NivelController {
  constructor(private readonly nivelService: NivelService) {}

  @Post()
  create(@Body() createNivelDto: CreateNivelDto) {
    return this.nivelService.create(createNivelDto);
  }

  @Get()
  findAll() {
    return this.nivelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nivelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNivelDto: UpdateNivelDto) {
    return this.nivelService.update(+id, updateNivelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nivelService.remove(+id);
  }
}