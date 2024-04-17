import { Task } from './task.entity';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Like } from 'typeorm';

@Injectable()
export class TaskRepository extends Repository<Task> {
  constructor(private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  getTasksWithFilters(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { status, search } = filterDto;
    let tasks;

    if (status) {
      tasks = this.find({
        where: {
          status,
        },
      });
    }

    if (search) {
      tasks = this.find({
        where: [
          { title: Like(`%${search}%`) },
          { description: Like(`%${search}%`) },
        ],
      });
    }

    return tasks;
  }
}
