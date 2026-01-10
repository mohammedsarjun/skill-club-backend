import { FilterQuery, UpdateQuery, ClientSession, PopulateOptions } from 'mongoose';

export interface IBaseRepository<T> {
  create(data: Partial<T>, session?: ClientSession): Promise<T>;
  findById(id: string, session?: ClientSession): Promise<T | null>;
  findAll(filter?: FilterQuery<T>, options?: {
    skip?: number;
    limit?: number;
    populate?: PopulateOptions | PopulateOptions[];
    session?: ClientSession;
  }): Promise<T[]>;
  updateById(id: string, data: UpdateQuery<T>, session?: ClientSession): Promise<T | null>;
  delete(id: string, session?: ClientSession): Promise<T | null>;
}
