import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity()
export class User {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Expose()
  @Column({ type: 'varchar', unique: true, length: 15 })
  username: string;

  @Expose()
  @Column({ type: 'varchar', length: 40 })
  email: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column({ type: 'varchar' })
  password: string;

  @Expose()
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: 'user_roles' })
  public roles: Role[];

  @Expose()
  @Column({ type: 'enum', enum: ['m', 'f', 'u'] })
  gender: string; /**
   * m - male
   * f - female
   * u - unspecified
   */

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @Expose()
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}
