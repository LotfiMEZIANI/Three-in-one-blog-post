import { Test, TestingModule } from '@nestjs/testing';
import { HobbyResolver } from './hobby.resolver';

describe('HobbyResolver', () => {
  let resolver: HobbyResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HobbyResolver],
    }).compile();

    resolver = module.get<HobbyResolver>(HobbyResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
