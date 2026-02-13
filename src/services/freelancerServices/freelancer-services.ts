import { injectable, inject } from 'tsyringe';
import '../../config/container';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { IFreelancerService } from './interfaces/freelancer-services.interface';
import type { IFreelancerRepository } from '../../repositories/interfaces/freelancer-repository.interface';
import {
  mapDtoToEducationModel,
  mapEducationModelToDTO,
  mapFreelancerToDTO,
  mapUpdateLanguageDtoToLanguage,
  mapUpdateLanguageToDTO,
  mapUpdateWorkHistoryToDTO,
} from '../../mapper/freelancer.mapper';
import { FetchFreelancerDTO } from '../../dto/freelancer.dto';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { IExperience, IFreelancerProfile } from '../../models/interfaces/user.model.interface';
import { CreatePortfolioDto, PortfolioDto } from '../../dto/portfolio.dto';
import {
  mapCreatePortfolioDtoToPortfolio,
  mapPortfolioToPortfolioDto,
} from '../../mapper/portfolio.mapper';
import type { IPortfolioRepository } from '../../repositories/interfaces/portfolio-respository.interface';
import { IPortfolio } from '../../models/interfaces/portfolio.model.interface';
import { EducationDTO } from '../../dto/user.dto';
import { validateData } from '../../utils/validation';
import { educationSchema } from '../../utils/validationSchemas/validations';
import { workExperienceSchema } from '../../utils/validationSchemas/freelancer-validations';
import { mapWorkHistoryToUserModel } from '../../mapper/user.mapper';
import {
  ExpertiseResponseDTO,
  UpdateExpertiseDTO,
  updateExpertiseSchema,
} from '../../dto/freelancerDTO/freelancer-expertise.dto';
import { mapExpertiseToResponseDTO } from '../../mapper/freelancerMapper/freelancer-expertise.mapper';
import { ICategoryRepository } from '../../repositories/interfaces/category-repository.interface';
import { ISpecialityRepository } from '../../repositories/interfaces/speciality-repository.interface';
import { ISkillRepository } from '../../repositories/interfaces/skill-repository.interface';
import { Types } from 'mongoose';

@injectable()
export class FreelancerService implements IFreelancerService {
  private _freelancerRepository: IFreelancerRepository;
  private _portfolioRepository: IPortfolioRepository;
  private _categoryRepository: ICategoryRepository;
  private _specialityRepository: ISpecialityRepository;
  private _skillRepository: ISkillRepository;
  constructor(
    @inject('IFreelancerRepository') freelancerRepository: IFreelancerRepository,
    @inject('IPortfolioRepository') portfolioRepository: IPortfolioRepository,
    @inject('ICategoryRepository') categoryRepository: ICategoryRepository,
    @inject('ISpecialityRepository') specialityRepository: ISpecialityRepository,
    @inject('ISkillRepository') skillRepository: ISkillRepository,
  ) {
    this._freelancerRepository = freelancerRepository;
    this._portfolioRepository = portfolioRepository;
    this._categoryRepository = categoryRepository;
    this._specialityRepository = specialityRepository;
    this._skillRepository = skillRepository;
  }

  async getFreelancerData(id: string): Promise<FetchFreelancerDTO> {
    try {
      const freelancerData = await this._freelancerRepository.getFreelancerById(id);
      if (!freelancerData || !freelancerData.freelancerProfile) {
        throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      const freelancerDto = mapFreelancerToDTO(freelancerData);

      return freelancerDto;
    } catch {
      throw new AppError(ERROR_MESSAGES.FREELANCER.FETCH_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateFreelancerLanguage(
    id: string,
    updateData: { language: { name: string; proficiency: string } },
  ): Promise<Partial<IFreelancerProfile> | undefined> {
    const freelancerData = await this._freelancerRepository.getFreelancerById(id);

    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const { freelancerProfile } = freelancerData;

    const languageNameArr = freelancerProfile.languages.map((lang) => lang.name);

    if (updateData?.language?.name && languageNameArr.includes(updateData?.language?.name)) {
      throw new AppError('You already have this language added.', HttpStatus.CONFLICT);
    }

    if (freelancerProfile.languages.length >= 3) {
      throw new AppError('You can only have 3 languages.', HttpStatus.CONFLICT);
    }

    const dto = mapUpdateLanguageDtoToLanguage(updateData?.language);

    const result = await this._freelancerRepository.addLanguageToFreelancerProfile(id, dto);

    return { languages: mapUpdateLanguageToDTO(result!) };
  }

  async deleteFreelancerLanguage(id: string, languageData: string): Promise<void> {
    const freelancerData = await this._freelancerRepository.getFreelancerById(id);

    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const { freelancerProfile } = freelancerData;

    const languageNameArr = freelancerProfile.languages.map((lang) => lang.name);

    if (!languageData && !languageNameArr.includes(languageData)) {
      throw new AppError('Language Not Found', HttpStatus.NOT_FOUND);
    }

    if (languageData == 'English') {
      throw new AppError(
        'You cannot delete English because it is the default language.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this._freelancerRepository.deleteLanguageFromFreelancerProfile(id, languageData);
  }

  async updateFreelancerDescription(
    freelancerId: string,
    descriptionData: { description: string },
  ): Promise<string | null> {
    const freelancerData = await this._freelancerRepository.getFreelancerById(freelancerId);

    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const user = await this._freelancerRepository.updateFreelancerProfile(freelancerId, {
      'freelancerProfile.bio': descriptionData.description,
    });

    const bio = user?.freelancerProfile?.bio || null;

    return bio;
  }

  async createPortfolio(id: string, portfolioData: CreatePortfolioDto): Promise<void> {
    const freelancerData = await this._freelancerRepository.getFreelancerById(id);

    if (!freelancerData || !freelancerData.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const dto = mapCreatePortfolioDtoToPortfolio(id, portfolioData);
    await this._portfolioRepository.createPortfolio(dto);
  }

  async getPortfolio(id: string): Promise<PortfolioDto[] | null> {
    const userId = id;
    const freelancerData = await this._freelancerRepository.getFreelancerById(userId);

    if (!freelancerData || !freelancerData.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const result: IPortfolio[] | null =
      await this._portfolioRepository.getPortfolioByFreelancerId(userId);

    const dto = result ? result.map(mapPortfolioToPortfolioDto) : null;

    return dto;
  }

  async getPortfolioDetail(
    freelancerId: string,
    portfolioId: string,
  ): Promise<PortfolioDto | null> {
    const freelancerData = await this._freelancerRepository.getFreelancerById(freelancerId);

    if (!freelancerData || !freelancerData.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const result: IPortfolio | null = await this._portfolioRepository.getPortfolioDetail(
      freelancerId,
      portfolioId,
    );

    const dto = result ? mapPortfolioToPortfolioDto(result) : null;

    return dto;
  }

  async updateFreelancerProfessionalRole(
    freelancerId: string,
    professionalRoleData: { professionalRole: string },
  ): Promise<string | null> {
    const freelancerData = await this._freelancerRepository.getFreelancerById(freelancerId);

    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const user = await this._freelancerRepository.updateFreelancerProfile(freelancerId, {
      'freelancerProfile.professionalRole': professionalRoleData.professionalRole,
    });

    const responseProfessionalRole = user?.freelancerProfile?.professionalRole || null;

    return responseProfessionalRole;
  }

  async updateFreelancerHourlyRate(
    freelancerId: string,
    hourlyRateData: {
      hourlyRate: number;
      currency?: 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD' | 'SGD' | 'JPY';
    },
  ): Promise<number | null> {
    const freelancerData = await this._freelancerRepository.getFreelancerById(freelancerId);

    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const user = await this._freelancerRepository.updateFreelancerProfile(freelancerId, {
      'freelancerProfile.hourlyRate': hourlyRateData.hourlyRate,
    });

    const responseHourlyRate = user?.freelancerProfile?.hourlyRate || null;

    return responseHourlyRate;
  }

  async addFreelancerEducation(
    freelancerId: string,
    educationData: EducationDTO,
  ): Promise<EducationDTO[] | null> {
    validateData(educationSchema, educationData);
    const freelancerData = await this._freelancerRepository.getFreelancerById(freelancerId);

    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const educationDto = mapDtoToEducationModel(educationData);

    const user = await this._freelancerRepository.addEducationToFreelancerProfile(
      freelancerId,
      educationDto,
    );

    return user ? user?.freelancerProfile?.education?.map(mapEducationModelToDTO) : user;
  }

  async deleteFreelancerEducation(freelancerId: string, educationId: string): Promise<void> {
    const freelancerData = await this._freelancerRepository.getFreelancerById(freelancerId);

    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this._freelancerRepository.deleteEducationFromFreelancerProfile(
      freelancerId,
      educationId,
    );
  }

  async deleteFreelancerPortfolio(freelancerId: string, portfolioId: string): Promise<void> {
    const freelancerData = await this._freelancerRepository.getFreelancerById(freelancerId);

    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const portfolio = await this._portfolioRepository.getFreelancerPortfolioById(
      freelancerId,
      portfolioId,
    );

    if (!portfolio) {
      throw new AppError(ERROR_MESSAGES.PORTFOLIO.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this._portfolioRepository.deletePortfolio(portfolioId);
  }

  async updateFreelancerWorkHistory(
    freelancerId: string,
    workHistory: IExperience,
  ): Promise<Partial<IFreelancerProfile> | null> {
    validateData(workExperienceSchema, workHistory);
    const freelancerData = await this._freelancerRepository.getFreelancerById(freelancerId);
    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const workHistoryDto = mapWorkHistoryToUserModel(workHistory);
    const result = await this._freelancerRepository.addWorkExperienceToFreelancerProfile(
      freelancerId,
      workHistoryDto,
    );

    if (!result) {
      return result;
    }

    return { experiences: mapUpdateWorkHistoryToDTO(result) };
  }

  async deleteFreelancerWorkHistory(freelancerId: string, workHistoryId: string): Promise<void> {
    const freelancerData = await this._freelancerRepository.getFreelancerById(freelancerId);

    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this._freelancerRepository.deleteWorkExperienceFromFreelancerProfile(
      freelancerId,
      workHistoryId,
    );
  }

  async updateFreelancerExpertise(
    freelancerId: string,
    expertiseData: UpdateExpertiseDTO,
  ): Promise<ExpertiseResponseDTO> {
    validateData(updateExpertiseSchema, expertiseData);

    const freelancerData = await this._freelancerRepository.getFreelancerById(freelancerId);
    if (!freelancerData?.freelancerProfile) {
      throw new AppError(ERROR_MESSAGES.FREELANCER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const categoryExists = await this._categoryRepository.findById(expertiseData.category);
    if (!categoryExists || categoryExists.status !== 'list') {
      throw new AppError('Invalid or unlisted category', HttpStatus.BAD_REQUEST);
    }

    const specialityIds = expertiseData.specialities.map((id) => new Types.ObjectId(id));
    const specialities = await this._specialityRepository.getListedSpecialitiesByIds(specialityIds);
    if (!specialities || specialities.length !== expertiseData.specialities.length) {
      throw new AppError('Invalid or unlisted specialities', HttpStatus.BAD_REQUEST);
    }

    const invalidSpecialities = specialities.filter(
      (spec) => spec.category.toString() !== expertiseData.category,
    );
    if (invalidSpecialities.length > 0) {
      throw new AppError(
        'Specialities must belong to the selected category',
        HttpStatus.BAD_REQUEST,
      );
    }

    const skillIds = expertiseData.skills.map((id) => new Types.ObjectId(id));
    const skills = await this._skillRepository.getListedSkillsByIds(skillIds);
    if (!skills || skills.length !== expertiseData.skills.length) {
      throw new AppError('Invalid or unlisted skills', HttpStatus.BAD_REQUEST);
    }

    const invalidSkills = skills.filter((skill) => {
      return !skill.specialities.some((specId) =>
        specialityIds.some((selectedSpecId) => selectedSpecId.toString() === specId.toString()),
      );
    });
    if (invalidSkills.length > 0) {
      throw new AppError('Skills must belong to the selected specialities', HttpStatus.BAD_REQUEST);
    }

    const updatedUser = await this._freelancerRepository.updateFreelancerExpertise(
      freelancerId,
      expertiseData.category,
      expertiseData.specialities,
      expertiseData.skills,
    );

    if (!updatedUser) {
      throw new AppError('Failed to update expertise', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return mapExpertiseToResponseDTO({
      workCategory: updatedUser.freelancerProfile.workCategory as Types.ObjectId,
      specialties: updatedUser.freelancerProfile.specialties as Types.ObjectId[],
      skills: updatedUser.freelancerProfile.skills as Types.ObjectId[],
    });
  }
}
