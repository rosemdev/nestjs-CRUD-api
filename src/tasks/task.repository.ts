import { Task } from './task.entity';
import { TaskStatus } from './task.status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { CreateTaskDto } from './dto/create-task.dto';

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TasksRepository', { timestamp: true });

  constructor(private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task: Task = new Task();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;

    return this.save(task);
  }

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    let search = filterDto.search;
    const status = filterDto.status;

    const query = this.createQueryBuilder('task');

    query.andWhere({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      search = search.toLocaleLowerCase();

      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();

      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user: ${user.username} due to error: ${error}`,
        error.stack,
      );

      throw new InternalServerErrorException();
    }
  }
}
