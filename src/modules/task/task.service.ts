import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from 'src/entity/task/task.entity';
import { User, UserRole } from 'src/entity/user/user.entity';
import { Tenant } from 'src/entity/tenant/tenant.entity';
import { UpdateTaskStatusDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async createTask(createDto: CreateTaskDto, currentUser: User): Promise<Task> {
    const { title, description, assignedToEmail, tenantId } = createDto;

    console.log(
      'PAYLOAD ISSSSSS..........',
      title,
      description,
      assignedToEmail,
      tenantId,
    );
    // Validate tenant exists
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) throw new ForbiddenException('Invalid tenant');
    console.log('TENANT DATA ISSSS.....', tenant);
    console.log(
      'DOES TENANT FROM THE CORRESPONDING TABLE?: ',
      currentUser.tenant.id,
      tenant.id,
    );
    // Ensure the current user belongs to the same tenant
    if (currentUser.tenant.id !== tenant.id) {
      throw new ForbiddenException(
        'You are not authorized to create tasks for this tenant',
      );
    }

    // Ensure the user creating the task has the proper role (Admin or Manager)
    if (![UserRole.ADMIN, UserRole.MANAGER].includes(currentUser.role)) {
      throw new ForbiddenException('Only Admins or Managers can create tasks');
    }

    // Find the user to assign the task to by email (instead of ID)
    const assignedTo = await this.userRepository.findOne({
      where: { email: assignedToEmail, tenant: { id: tenantId } },
    });
    if (!assignedTo)
      throw new ForbiddenException('Assigned user not found in this tenant');

    // Create the task with all the related data
    const task = this.taskRepository.create({
      title,
      description,
      assignedTo,
      createdBy: currentUser,
      tenant,
    });

    // Save and return the task
    return this.taskRepository.save(task);
  }

  async getTasksByTenant(tenantId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { tenant: { id: tenantId } },
      relations: ['assignedTo', 'createdBy'],
    });
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { assignedTo: { id: userId } },
      relations: ['assignedTo', 'createdBy'], // Include relations for assigned users
    });
  }
  async updateTaskStatus(
    user: User,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    const { taskId, status } = updateTaskStatusDto;

    // Find the task
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['tenant', 'assignedTo'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Ensure task belongs to the same tenant as the user
    if (task.tenant.id !== user.tenant.id) {
      throw new ForbiddenException('You do not have access to this task');
    }

    // Ensure only the assigned user can update the status
    if (task.assignedTo.id !== user.id) {
      throw new ForbiddenException('You can only update your assigned tasks');
    }

    // Update the task status
    task.status = status;
    return this.taskRepository.save(task);
  }

  async deleteTask(
    taskId: string,
    tenantId: string,
    user: User,
  ): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new ForbiddenException('Invalid tenant');
    }

    const task = await this.taskRepository.findOne({
      where: { id: taskId, tenant: { id: tenantId } },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (user.role !== 'Admin' && user.role !== 'Manager') {
      throw new ForbiddenException('Only Admins or Managers can delete tasks');
    }

    await this.taskRepository.remove(task);
  }
}
