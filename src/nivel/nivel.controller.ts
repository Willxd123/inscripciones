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
import { NivelService } from './nivel.service';
import { CreateNivelDto } from './dto/create-nivel.dto';
import { UpdateNivelDto } from './dto/update-nivel.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('nivel')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NivelController {
  private nivelWrapper: any;
  constructor(private readonly genericWrapperService: GenericWrapperService) {
    this.nivelWrapper =
      this.genericWrapperService.createServiceWrapper('nivel');
  }
  @Post()
  create(@Body() createNivelDto: CreateNivelDto) {
    return this.nivelWrapper.create(createNivelDto);
  }

  @Get()
  findAll() {
    return this.nivelWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nivelWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNivelDto: UpdateNivelDto) {
    return this.nivelWrapper.update(+id, updateNivelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nivelWrapper.remove(+id);
  }
}
