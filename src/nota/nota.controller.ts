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
import { NotaService } from './nota.service';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('nota')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotaController {
  private notaWrapper: any;
  constructor(private readonly envolventeGenericaService: EnvolventeGenericaService) {
    this.notaWrapper = this.envolventeGenericaService.crearEnvolventeServicio('nota');
  }
  @Post()
  create(@Body() createNotaDto: CreateNotaDto) {
    return this.notaWrapper.create(createNotaDto);
  }

  @Get()
  findAll() {
    return this.notaWrapper.findAll();
  }

  @Get(':grupoMateriaId/:estudianteId')
  findOne(
    @Param('grupoMateriaId') grupoMateriaId: string,
    @Param('estudianteId') estudianteId: string,
  ) {
    return this.notaWrapper.findOne(+grupoMateriaId, +estudianteId);
  }

  @Patch(':grupoMateriaId/:estudianteId')
  update(
    @Param('grupoMateriaId') grupoMateriaId: string,
    @Param('estudianteId') estudianteId: string,
    @Body() updateNotaDto: UpdateNotaDto,
  ) {
    return this.notaWrapper.update(
      +grupoMateriaId,
      +estudianteId,
      updateNotaDto,
    );
  }

  @Delete(':grupoMateriaId/:estudianteId')
  remove(
    @Param('grupoMateriaId') grupoMateriaId: string,
    @Param('estudianteId') estudianteId: string,
  ) {
    return this.notaWrapper.remove(+grupoMateriaId, +estudianteId);
  }
}
