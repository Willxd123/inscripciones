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
import { AulaService } from './aula.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('aula')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AulaController {
  private aulaWrapper: any;

  constructor(private readonly envolventeGenericaService: EnvolventeGenericaService) {
    this.aulaWrapper = this.envolventeGenericaService.crearEnvolventeServicio('aula');
  }

  @Post()
  create(@Body() createAulaDto: CreateAulaDto) {
    return this.aulaWrapper.create(createAulaDto);
  }

  @Get()
  findAll() {
    return this.aulaWrapper.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aulaWrapper.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAulaDto: UpdateAulaDto) {
    return this.aulaWrapper.update(+id, updateAulaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aulaWrapper.remove(+id);
  }
}
