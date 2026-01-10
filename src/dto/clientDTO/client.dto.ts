export interface GetClientDTO {
  companyName: string;
  logo?: string | undefined;
  description?: string;
  website?: string;
}

export interface UpdateClientDto {
  clientProfile: Partial<GetClientDTO>;
}
