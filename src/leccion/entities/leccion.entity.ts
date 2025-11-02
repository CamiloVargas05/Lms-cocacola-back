import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Modulo } from 'src/modulos/entities/modulo.entity';

@Entity('leccion')
export class Leccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  descripcion: string;

  @Column()
  imagen: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column('text', { array: true, nullable: true })
  archivos: string[]; // rutas o URLs de los PDFs

  @Column('text')
  contenidoTexto: string;

  // Relación: cada lección pertenece a un módulo
  @ManyToOne(() => Modulo, (modulo) => modulo.lecciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modulo_id' })
  modulo: Modulo;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}