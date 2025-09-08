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
  Query,
} from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AsyncWrapperService } from '../queues/async-wrapper.service';

@Controller('carrera')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CarreraController {
  constructor(
    private readonly carreraService: CarreraService,
    private readonly asyncWrapper: AsyncWrapperService,
  ) {}

  @Post()
  async create(@Body() createCarreraDto: CreateCarreraDto) {
    return this.asyncWrapper.executeOrQueue(
      'carrera',
      'create',
      createCarreraDto,
      () => this.carreraService.create(createCarreraDto),
    );
  }

  @Get()
  async findAll(@Query('force_sync') forceSync?: string) {
    // Si se fuerza modo sync, ejecutar directamente
    if (forceSync === 'true') {
      const result = await this.carreraService.findAll();
      return {
        result,
        status: 'completed',
        mode: 'sync',
        timestamp: new Date(),
      };
    }

    return this.asyncWrapper.executeOrQueue('carrera', 'findAll', {}, () =>
      this.carreraService.findAll(),
    );
  }

  @Get('result/:requestId')
  async getAsyncResult(@Param('requestId') requestId: string) {
    return this.asyncWrapper.getAsyncResult(requestId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('force_sync') forceSync?: string) {
    if (forceSync === 'true') {
      const result = await this.carreraService.findOne(+id);
      return {
        result,
        status: 'completed',
        mode: 'sync',
        timestamp: new Date(),
      };
    }

    return this.asyncWrapper.executeOrQueue(
      'carrera',
      'findOne',
      { id: +id },
      () => this.carreraService.findOne(+id),
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCarreraDto: UpdateCarreraDto,
  ) {
    return this.asyncWrapper.executeOrQueue(
      'carrera',
      'update',
      { id: +id, ...updateCarreraDto },
      () => this.carreraService.update(+id, updateCarreraDto),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.asyncWrapper.executeOrQueue(
      'carrera',
      'delete',
      { id: +id },
      () => this.carreraService.remove(+id),
    );
  }
}