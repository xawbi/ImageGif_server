import { Test, TestingModule } from '@nestjs/testing'
import { BgProfileService } from '../bg_profile.service'

describe('BgProfileService', () => {
  let service: BgProfileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BgProfileService],
    }).compile()

    service = module.get<BgProfileService>(BgProfileService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
