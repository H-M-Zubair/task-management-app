import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from 'src/entity/task/task.entity';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/auth.guard';
import { UpdateTaskStatusDto } from './dto/update-task.dto';
import { User, UserRole } from 'src/entity/user/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Mutation(() => Task, { description: 'Create a new task' })
  @UseGuards(GqlAuthGuard) // Ensure user is authenticated via JWT token
  async createTask(
    @Args('createTaskInput') createDto: CreateTaskDto,
    @CurrentUser() currentUser: User, // Get the current logged-in user from the token
  ): Promise<Task> {
    return this.taskService.createTask(createDto, currentUser);
  }

  @Query(() => [Task], { description: 'Fetch tasks for a specific tenant' })
  @UseGuards(GqlAuthGuard)
  async getTasksByTenant(@Args('tenantId') tenantId: string): Promise<Task[]> {
    return this.taskService.getTasksByTenant(tenantId);
  }

  // Fetch tasks assigned to the currently logged-in user
  @Query(() => [Task], {
    description: 'Fetch tasks assigned to the current user',
  })
  @UseGuards(GqlAuthGuard) // Ensure the user is authenticated
  async getTasksByUserId(@CurrentUser() user: User): Promise<Task[]> {
    return this.taskService.getTasksByUserId(user.id); // Pass user ID to service method
  }

  @Mutation(() => Task)
  @UseGuards(GqlAuthGuard)
  async updateTaskStatus(
    @Args('updateTaskStatusDto') updateTaskStatusDto: UpdateTaskStatusDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.taskService.updateTaskStatus(user, updateTaskStatusDto);
  }

  @Mutation(() => Boolean, { description: 'Delete a task' })
  @UseGuards(GqlAuthGuard)
  async deleteTask(
    @Args('taskId') taskId: string, // Task ID to delete
    @Args('tenantId') tenantId: string, // Tenant ID to ensure proper isolation
    @CurrentUser() user: User, // Currently logged-in user
  ): Promise<boolean> {
    try {
      await this.taskService.deleteTask(taskId, tenantId, user);
      return true;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
}
