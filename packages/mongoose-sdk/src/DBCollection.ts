// Types
import {
  Document,
  Connection,
  Schema,
  Model,
} from 'mongoose';

export interface DBCollection<T> {
  /**
   * The model name.
   */
  name: string;

  /**
   * The schema of the collection (documents).
   */
  schema: Schema<T & Document>;

  /**
   * The name of the MongoDB collection (optional). If not given it will be
   * induced from the model name.
   */
  collectionName?: string;

  /**
   * The model of the collection.
   */
  Model: Model<T & Document>;

  /**
   * Sets up the DB model within the context of the connection.
   */
  setup(connection: Connection): Model<T & Document>;
}
