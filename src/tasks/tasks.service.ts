import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task.status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(private taskRepository: TaskRepository) {}

  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);

    task.status = status;
    await this.taskRepository.save(task);

    return task;
  }

  async deleteTaskById(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException();
    }
  }
}
