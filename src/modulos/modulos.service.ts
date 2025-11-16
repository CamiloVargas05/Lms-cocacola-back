import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modulo } from './entities/modulo.entity';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { Curso } from 'src/cursos/entities/curso.entity';
import { LeccionService } from 'src/leccion/leccion.service';

@Injectable()
export class ModulosService {
  constructor(
    @InjectRepository(Modulo)
    private readonly modulosRepository: Repository<Modulo>,

    @InjectRepository(Curso)
    private readonly cursosRepository: Repository<Curso>,

    private readonly leccionService: LeccionService,
  ) {}

  async create(createModuloDto: CreateModuloDto): Promise<Modulo> {
    const curso = await this.cursosRepository.findOne({
      where: { id: createModuloDto.cursoId },
    });
    if (!curso) throw new NotFoundException('Curso not found');

    const modulo = this.modulosRepository.create({
      titulo: createModuloDto.titulo,
      descripcion: createModuloDto.descripcion,
      imagen: createModuloDto.imagen,
      curso,
    });

    return this.modulosRepository.save(modulo);
  }

  async findAll(): Promise<Modulo[]> {
    return this.modulosRepository.find({ relations: ['curso', 'lecciones'] });
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
    Object.assign(modulo, updateModuloDto);
    return this.modulosRepository.save(modulo);
  }

  async remove(id: number): Promise<void> {
    const modulo = await this.findOne(id);
    if (!modulo) throw new NotFoundException('Modulo not found');

    const lecciones = modulo.lecciones || [];
    for (const leccion of lecciones) {
      await this.leccionService.remove(leccion.id);
    }

    await this.modulosRepository.remove(modulo);
  }
}