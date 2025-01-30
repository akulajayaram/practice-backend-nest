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
import { IsOptional } from 'class-validator';

@Entity('users')
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
  @Column({ type: 'varchar', length: 40, unique: true })
  email: string;

  @IsOptional() // Mark as optional for validation purposes
  @Expose()
  @Column({ type: 'date', nullable: true }) // Allow null values in the database
  dob?: Date;

  @Column({ type: 'varchar' })
  password: string;

  @Expose()
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: 'user_roles' })
  public roles: Role[];

  @Expose()
  @Column({ type: 'enum', enum: ['m', 'f', 'u'], default: 'u' })
  gender: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @Expose()
  @Column({ default: true })
  isActive: boolean;

  @Expose()
  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  resetOtp: string;

  @Column({ type: 'timestamp', nullable: true })
  resetOtpExpiresAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}
