import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeccionService } from './leccion.service';
import { LeccionController } from './leccion.controller';
import { Leccion } from './entities/leccion.entity';
import { Modulo } from 'src/modulos/entities/modulo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Leccion, Modulo])],
  controllers: [LeccionController],
  providers: [LeccionService],
  exports: [LeccionService],
})
export class LeccionModule {}