import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursosService } from './cursos.service';
import { CursosController } from './cursos.controller';
import { Curso } from './entities/curso.entity';
import { Modulo } from 'src/modulos/entities/modulo.entity';
import { ModulosModule } from 'src/modulos/modulos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Curso, Modulo]),
    ModulosModule,
  ],
  controllers: [CursosController],
  providers: [CursosService],
  exports: [CursosService],
})
export class CursosModule {}