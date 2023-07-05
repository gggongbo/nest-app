import { Controller, Get, Param } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('/:search/:page')
  searchBook(@Param() params: any): any {
    return this.booksService.searchBook(params);
  }
}
