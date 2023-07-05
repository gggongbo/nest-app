import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { HttpModule } from '@nestjs/axios';

describe('BooksService', () => {
  let service: BooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BooksService],
      imports: [HttpModule],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchBook', () => {
    it('should return object', () => {
      const params = { search: 'test', page: '1' };
      const result = service.searchBook(params);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
