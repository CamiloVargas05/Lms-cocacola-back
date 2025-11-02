import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Curso } from 'src/cursos/entities/curso.entity';
import { Leccion } from 'src/leccion/entities/leccion.entity';

@Entity('modulos')
export class Modulo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  descripcion: string;

  @Column()
  imagen: string;

  // Relación: cada módulo pertenece a un curso
  @ManyToOne(() => Curso, curso => curso.modulos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso;

  // Relación: un módulo tiene muchas lecciones
  @OneToMany(() => Leccion, leccion => leccion.modulo)
  lecciones: Leccion[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}