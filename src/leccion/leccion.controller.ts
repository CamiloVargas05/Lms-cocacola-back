import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LeccionService } from './leccion.service';
import { CreateLeccionDto } from './dto/create-leccion.dto';
import { UpdateLeccionDto } from './dto/update-leccion.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('leccion')
export class LeccionController {
  constructor(private readonly leccionService: LeccionService) {}

  @Post()
  create(@Body() createLeccionDto: CreateLeccionDto) {
    return this.leccionService.create(createLeccionDto);
  }

  @Get()
  findAll(@Query('moduloId') moduloId?: number) {
    return this.leccionService.findAll().then((lecciones) => {
      if (moduloId) {
        return lecciones.filter((l) => l.modulo?.id === Number(moduloId));
      }
      return lecciones;
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leccionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeccionDto: UpdateLeccionDto) {
    return this.leccionService.update(+id, updateLeccionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leccionService.remove(+id);
  }
}