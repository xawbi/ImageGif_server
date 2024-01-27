import { Test, TestingModule } from '@nestjs/testing'
import { Bg_profileService } from '../bg_profile.service'

describe('BgProfileService', () => {
  let service: Bg_profileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Bg_profileService],
    }).compile()

    service = module.get<Bg_profileService>(Bg_profileService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
