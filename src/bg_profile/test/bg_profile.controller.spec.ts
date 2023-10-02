import { Test, TestingModule } from '@nestjs/testing'
import { BgProfileController } from '../bg_profile.controller'
import { BgProfileService } from '../bg_profile.service'

describe('BgProfileController', () => {
  let controller: BgProfileController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BgProfileController],
      providers: [BgProfileService],
    }).compile()

    controller = module.get<BgProfileController>(BgProfileController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
