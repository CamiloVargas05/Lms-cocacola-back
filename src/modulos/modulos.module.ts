import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulosService } from './modulos.service';
import { ModulosController } from './modulos.controller';
import { Modulo } from './entities/modulo.entity';
import { Curso } from 'src/cursos/entities/curso.entity';
import { LeccionModule } from 'src/leccion/leccion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Modulo, Curso]),
    LeccionModule,
  ],
  controllers: [ModulosController],
  providers: [ModulosService],
  exports: [ModulosService],
})
export class ModulosModule {}