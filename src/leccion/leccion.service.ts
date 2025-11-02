import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leccion } from './entities/leccion.entity';
import { CreateLeccionDto } from './dto/create-leccion.dto';
import { UpdateLeccionDto } from './dto/update-leccion.dto';
import { Modulo } from 'src/modulos/entities/modulo.entity';

@Injectable()
export class LeccionService {
  constructor(
    @InjectRepository(Leccion)
    private readonly leccionRepository: Repository<Leccion>,

    @InjectRepository(Modulo)
    private readonly modulosRepository: Repository<Modulo>,
  ) {}

  async create(createLeccionDto: CreateLeccionDto): Promise<Leccion> {
    const { moduloId, ...data } = createLeccionDto;

    const modulo = await this.modulosRepository.findOne({ where: { id: moduloId } });
    if (!modulo) throw new NotFoundException(`Modulo with ID ${moduloId} not found`);

    const leccion = this.leccionRepository.create({
      ...data,
      modulo,
    });

    return await this.leccionRepository.save(leccion);
  }

  async findAll(): Promise<Leccion[]> {
    return this.leccionRepository.find({ relations: ['modulo'] });
  }

  async findOne(id: number): Promise<Leccion> {
    const leccion = await this.leccionRepository.findOne({
      where: { id },
      relations: ['modulo'],
    });
    if (!leccion) throw new NotFoundException('Leccion not found');
    return leccion;
  }

  async update(id: number, updateLeccionDto: UpdateLeccionDto): Promise<Leccion> {
    const leccion = await this.findOne(id);

    if (updateLeccionDto.moduloId) {
      const modulo = await this.modulosRepository.findOne({ where: { id: updateLeccionDto.moduloId } });
      if (!modulo) throw new NotFoundException(`Modulo with ID ${updateLeccionDto.moduloId} not found`);
      leccion.modulo = modulo;
    }

    Object.assign(leccion, updateLeccionDto);
    return await this.leccionRepository.save(leccion);
  }

  async remove(id: number): Promise<void> {
    const leccion = await this.findOne(id);
    await this.leccionRepository.remove(leccion);
  }
}