import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { TaskStatus } from './task.status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@Injectable()
export class TasksService {
  constructor(private taskRepository: TaskRepository) {}

  getAllTasks(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  getTasksWithFilters(filterDto: GetTasksFilterDto): Promise<Task[]> {
    return this.taskRepository.getTasksWithFilters(filterDto);
  }

  createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;

    const task: Task = new Task();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;

    return this.taskRepository.save(task);
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }

  // updateTaskStatus(id: string, status: TaskStatus): Task {
  //   const task = this.getTaskById(id);

  //   if (task) {
  //     task.status = status;
  //   }

  //   return task;
  // }

  // deleteTaskById(id: string): void {
  //   this.tasks = this.tasks.filter((item) => {
  //     return item.id !== id;
  //   });
  // }
}
