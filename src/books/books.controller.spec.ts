import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { HttpModule } from '@nestjs/axios';
import { BooksService } from './books.service';

describe('BooksController', () => {
  let controller: BooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      imports: [HttpModule],
      providers: [BooksService],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchBook', () => {
    it('should return object', async () => {
      const params = { search: 'test', page: '1' };
      const result = controller.searchBook(params);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
