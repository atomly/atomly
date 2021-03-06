// Libraries
import {
  Model,
  Document,
  FilterQuery,
} from 'mongoose';

// Dependencies
import {
  DEFAULT_ENTITY_PROPERTY_KEY,
  DEFAULT_ORDER_BY_KEY,
  DEFAULT_ORDER_BY_VALUE,
} from './constants';

// Types
import { MongooseDataAdapterOptions } from '../types';

/**
 * Batch function for a DataLoader structured for a One to Many relation.
 * @param ids - Array of IDs of related entity.
 * @param entityModel - Mongoose Model of the entity that will be batched.
 * @param batchFnOptions - Parameters for the batch function query. 
 */
export async function oneToManyBatchFn<
  T extends object,
  R extends object | Array<unknown>,
>(
  ids: readonly (string | number)[],
  entityModel: Model<T & Document>,
  batchFnOptions: MongooseDataAdapterOptions<T, R>['batchFnOptions'] = { entityKey: DEFAULT_ENTITY_PROPERTY_KEY },
): Promise<T[][]> {
  const {
    entityKey,
    filterQuery = Object.assign(
      {},
      batchFnOptions.filterQuery ?? {},
      {
        [entityKey]: { $in: ids },
      },
    ),
    projectionOptions = {},
    queryOptions = Object.assign(
      {},
      batchFnOptions.queryOptions ?? {},
      {
        sort: {
          [DEFAULT_ORDER_BY_KEY]: DEFAULT_ORDER_BY_VALUE,
        },
      },
    ),
    shouldLean = true,
  } = batchFnOptions;

  // Setting up the default query object properties:

  let query = entityModel.find(filterQuery as FilterQuery<T & Document>, projectionOptions, queryOptions);

  if (shouldLean) { query = query.lean(); }

  const entities = await query.exec();

  // Entities map that will hold the fetched entities. Each related entity ID will be assigned its respective entity.
  const entitiesMap = ids.reduce(
    (map: Record<string, T[]>, id) => {
      map[id] = [];
      return map;
      },
    {},
  );

  // Key identifier of the entity.
  const key = entityKey as keyof typeof entities[number];

  // Assigning the respective entities then returning them:
  entities.forEach(entity => {
    (entitiesMap[entity[key]] as Array<unknown>).push(entity);
  });

  return ids.map(id => entitiesMap[id]);
}
