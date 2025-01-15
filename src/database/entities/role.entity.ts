import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  name: string;

  // Many-to-Many relationship with Permission
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions', // Name of the join table
    joinColumn: { name: 'role_id', referencedColumnName: 'id' }, // Role side of the join
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }, // Permission side of the join
  })
  permissions: Permission[];

  // Many-to-Many relationship with User
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
