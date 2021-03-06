// Dependencies
import { parseTopic } from '../../utils';

// Types
import { TStorageServicePayload, EStorageServiceSetExpiracyModes } from '../../storages';
import { IPublisherService, IPublisherServicePublishOptions } from '../PublisherService';

const DEFAULT_EXPIRACY_TIME = '3600'; // 1 hour of expiracy time when paired with the EX mode
const DEFAULT_EXPIRACY_MODE = EStorageServiceSetExpiracyModes.EX;

export class DefaultPublisherService implements IPublisherService {
  public _eventsService: IPublisherService['_eventsService'];
  public _storageService: IPublisherService['_storageService'];

  constructor(
    args: {
      eventsService: IPublisherService['_eventsService']
      storageService: IPublisherService['_storageService']
    },
  ) {
    this._eventsService = args.eventsService;
    this._storageService = args.storageService;
  }

  public async publish(topic: string, payload: TStorageServicePayload, options: IPublisherServicePublishOptions = {}): Promise<void> {
    // A key is generated when storing payloads, this key is forwarded subscriber handlers.
    // The subscriber service is in charge of getting the values from the Storage Service
    // using this key, when the subscriber handler is executed.
    const key = await this._storageService.store(
      payload,
      {
        expiracyTime: options.expiracyTime ?? DEFAULT_EXPIRACY_TIME,
        expiryMode: options.expiryMode ?? DEFAULT_EXPIRACY_MODE,
      },
    );
    // Publishing event AFTER the payload has been stored:
    const parsedTopic = parseTopic(String(topic), options.filter);
    await this._eventsService.emit(
      parsedTopic,
      key,
    );
  }
}
