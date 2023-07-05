import { Injectable } from '@nestjs/common';
import { getBookDTO } from '@domain';
type SearchBookParams = {
  search: string;
  page: string;
};

@Injectable()
export class BooksService {
  searchBook(params: SearchBookParams): any {
    const testDTO = getBookDTO({ title: 'a', subtitle: 'b', image: 'c' });
    console.log('test', params, testDTO);
    return null;
  }
}
