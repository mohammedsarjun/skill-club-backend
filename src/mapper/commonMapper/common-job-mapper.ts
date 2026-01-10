import { JobQueryParams } from '../../dto/commonDTO/job-common.dto';

export function mapJobQuery(dto: JobQueryParams): JobQueryParams {
  // Normalize and clean up query parameters
  const search = dto?.search?.trim() || '';
  const page = dto.page ? Number(dto.page) : 1;
  const limit = dto.limit ? Number(dto.limit) : 10;

  // Prepare filters safely
  const status =
    dto?.filters?.status && dto.filters.status.trim() !== '' ? dto.filters.status : undefined;

  return {
    search,
    page,
    limit,
    filters: {
      ...(status && { status }),
    },
  };
}
