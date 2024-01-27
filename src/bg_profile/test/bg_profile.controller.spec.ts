import { Test, TestingModule } from '@nestjs/testing'
import { Bg_profileController } from '../bg_profile.controller'
import { Bg_profileService } from '../bg_profile.service'

describe('BgProfileController', () => {
  let controller: Bg_profileController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Bg_profileController],
      providers: [Bg_profileService],
    }).compile()

    controller = module.get<Bg_profileController>(Bg_profileController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
