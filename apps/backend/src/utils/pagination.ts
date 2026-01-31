import { PaginationParams, PaginatedResponse } from '@smartslot/shared';

export interface PaginateOptions extends PaginationParams {
    maxLimit?: number | undefined;
}

export async function paginate<T>(
    model: any,
    queryArgs: any = {},
    options: PaginateOptions = {}
): Promise<PaginatedResponse<T>> {
    const page = Math.max(1, Number(options.page || 1));
    const maxLimit = options.maxLimit || 100;
    const limit = Math.min(maxLimit, Math.max(1, Number(options.limit || 10)));
    const skip = (page - 1) * limit;

    const [totalItems, items] = await Promise.all([
        model.count({ where: queryArgs.where }),
        model.findMany({
            ...queryArgs,
            skip,
            take: limit,
        }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
        items,
        meta: {
            totalItems,
            itemCount: items.length,
            itemsPerPage: limit,
            totalPages,
            currentPage: page,
        },
    };
}
