import { GetClientDTO, UpdateClientDto } from '../../dto/clientDTO/client.dto';
import { IClientProfile } from '../../models/interfaces/user.model.interface';

export const mapClientToDTO = (clientData: IClientProfile): GetClientDTO => {
  return {
    companyName: clientData.companyName,
    logo: clientData?.logo || '',
    description: clientData?.description || '',
    website: clientData?.website || '',
  };
};

export const mapUpdateClientDtoToClientModel = (clientData: GetClientDTO): UpdateClientDto => {
  const dtoObj: Partial<GetClientDTO> = {};

  if (clientData.companyName) {
    dtoObj.companyName = clientData.companyName;
  }

  if (clientData.description) {
    dtoObj.description = clientData.description;
  }

  if (clientData.logo) {
    dtoObj.logo = clientData.logo;
  }

  if (clientData.website) {
    dtoObj.website = clientData.website;
  }
  return { clientProfile: dtoObj };
};
