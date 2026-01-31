import { ApiResponse } from '@smartslot/shared';
import { Response } from 'express';

// Express Response with strict typed body
export type TypedResponse<T> = Response<ApiResponse<T>>;
