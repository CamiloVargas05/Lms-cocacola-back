import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modulo } from './entities/modulo.entity';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { Curso } from 'src/cursos/entities/curso.entity';

@Injectable()
export class ModulosService {
  constructor(
    @InjectRepository(Modulo)
    private readonly modulosRepository: Repository<Modulo>,

    @InjectRepository(Curso)
    private readonly cursosRepository: Repository<Curso>,
  ) {}

  async create(createModuloDto: CreateModuloDto): Promise<Modulo> {
    const { cursoId, ...data } = createModuloDto;

    const curso = await this.cursosRepository.findOne({ where: { id: cursoId } });
    if (!curso) throw new NotFoundException(`Curso with ID ${cursoId} not found`);

    const modulo = this.modulosRepository.create({
      ...data,
      curso,
    });

    return await this.modulosRepository.save(modulo);
  }

  async findAll(): Promise<Modulo[]> {
    return this.modulosRepository.find({
      relations: ['curso', 'lecciones'],
    });
  }

  async findOne(id: number): Promise<Modulo> {
    const modulo = await this.modulosRepository.findOne({
      where: { id },
      relations: ['curso', 'lecciones'],
    });
    if (!modulo) throw new NotFoundException('Modulo not found');
    return modulo;
  }

  async update(id: number, updateModuloDto: UpdateModuloDto): Promise<Modulo> {
    const modulo = await this.findOne(id);

    if (updateModuloDto.cursoId) {
      const curso = await this.cursosRepository.findOne({ where: { id: updateModuloDto.cursoId } });
      if (!curso) throw new NotFoundException(`Curso with ID ${updateModuloDto.cursoId} not found`);
      modulo.curso = curso;
    }

    Object.assign(modulo, updateModuloDto);
    return await this.modulosRepository.save(modulo);
  }

  async remove(id: number): Promise<void> {
    const modulo = await this.findOne(id);
    await this.modulosRepository.remove(modulo);
  }
}