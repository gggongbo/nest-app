import { Controller, Get, Param } from '@nestjs/common';
import {
  BooksService,
  SearchBookParams,
  SearchBookReturns,
} from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('/:search/:page')
  searchBook(@Param() params: SearchBookParams): Promise<SearchBookReturns> {
    return this.booksService.searchBook(params);
  }
}
