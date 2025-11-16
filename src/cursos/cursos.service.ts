import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from './entities/curso.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { ModulosService } from 'src/modulos/modulos.service';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursosRepository: Repository<Curso>,

    private readonly modulosService: ModulosService,
  ) { }

  async create(createCursoDto: CreateCursoDto): Promise<Curso> {
    const curso = this.cursosRepository.create(createCursoDto);
    return this.cursosRepository.save(curso);
  }

  async findAll(): Promise<Curso[]> {
    return this.cursosRepository.find({ relations: ['modulos'] });
  }

  async findOne(id: number): Promise<Curso> {
    const curso = await this.cursosRepository.findOne({
      where: { id },
      relations: ['modulos'],
    });

    if (!curso) throw new NotFoundException('Curso not found');
    return curso;
  }

  async update(id: number, updateCursoDto: UpdateCursoDto): Promise<Curso> {
    const curso = await this.findOne(id);
    Object.assign(curso, updateCursoDto);
    return this.cursosRepository.save(curso);
  }

  async remove(id: number): Promise<void> {
    const curso = await this.findOne(id);

    if (!curso) throw new NotFoundException('Curso not found');

    const modulos = curso.modulos || [];

    for (const modulo of modulos) {
      await this.modulosService.remove(modulo.id);
    }

    await this.cursosRepository.remove(curso);
  }
}