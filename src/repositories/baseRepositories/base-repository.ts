import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  PopulateOptions,
  ClientSession,
} from 'mongoose';
import { IBaseRepository } from './interfaces/base-repository.interface';
export default class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>, session?: ClientSession): Promise<T> {
    if (session) {
      const docs = await this.model.create([data], { session });
      return docs[0];
    }
    const doc = new this.model(data);
    return await doc.save();
  }

  async findOne<R = T>(
    filter: FilterQuery<T>,
    options?: { populate?: PopulateOptions | PopulateOptions[]; session?: ClientSession },
  ): Promise<R | null> {
    let query = this.model.findOne(filter);

    if (options?.populate) {
      query = query.populate(options.populate);
    }

    if (options?.session) {
      query = query.session(options.session);
    }

    return (await query.exec()) as unknown as R | null;
  }

  async findById(id: string, session?: ClientSession): Promise<T | null> {
    const query = this.model.findById(id);
    if (session) {
      query.session(session);
    }
    return await query.exec();
  }

  async findAll<R = T>(
    filter: FilterQuery<T> = {},
    options?: {
      skip?: number;
      limit?: number;
      populate?: PopulateOptions | PopulateOptions[];
      session?: ClientSession;
    },
  ): Promise<R[]> {
    let query = this.model.find(filter);

    if (options?.skip) query = query.skip(options.skip);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.populate) query = query.populate(options.populate);
    if (options?.session) query = query.session(options.session);

    return (await query.exec()) as unknown as R[];
  }

  async updateById<R = T>(
    id: string,
    data: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<R | null> {
    const query = this.model.findByIdAndUpdate(id, data, { new: true });
    if (session) {
      query.session(session);
    }
    return (await query.exec()) as unknown as R | null;
  }

  async update(
    filter: FilterQuery<T>,
    data?: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<T | null> {
    const query = this.model.findOneAndUpdate(filter, data, { new: true });
    if (session) {
      query.session(session);
    }
    return await query.exec();
  }

  async delete(id: string, session?: ClientSession): Promise<T | null> {
    const query = this.model.findByIdAndDelete(id);
    if (session) {
      query.session(session);
    }
    return await query.exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter).exec();
  }
}
