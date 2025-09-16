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
import { GrupoService } from './grupo.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('grupo')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class GrupoController {
  private grupoWrapper: any;
  constructor(private readonly genericWrapperService: GenericWrapperService) {
    this.grupoWrapper =
      this.genericWrapperService.createServiceWrapper('grupo');
  }

  @Post()
  create(@Body() createGrupoDto: CreateGrupoDto) {
    return this.grupoWrapper.create(createGrupoDto);
  }

  @Get()
  findAll() {
    return this.grupoWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.grupoWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGrupoDto: UpdateGrupoDto) {
    return this.grupoWrapper.update(+id, updateGrupoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.grupoWrapper.remove(+id);
  }
}
