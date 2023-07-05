import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { BookDTO } from '@domain/dtos';

type SearchBookParams = {
  search: string;
  page: string;
};

//이용하는 api에서 반환되는 Book 타입선언
type Book = {
  title: string;
  subtitle: string;
  isbn13: string;
  price: string;
  image: string;
  url: string;
};

@Injectable()
export class BooksService {
  constructor(private readonly httpService: HttpService) {}

  async searchBook(params: SearchBookParams): Promise<any> {
    if (
      !params ||
      !params?.search?.trim().length ||
      !params?.page?.trim().length
    ) {
      throw new Error('[backend] searchBook empty params');
    }

    const { valid, notKeywordList } = this.checkParams(params);

    if (!valid) {
      throw new Error('[backend] searchBook invalid params');
    }

    if (!!notKeywordList && notKeywordList?.length === 2) {
      const result = await this.getNotKeywordBookList({
        notKeywordList: notKeywordList,
        page: params.page,
      });
      return result;
    } else {
      const { data } = await firstValueFrom(
        this.httpService
          .get<any>(
            `https://api.itbook.store/1.0/search/${params.search}/${params.page}`,
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.error(error.response.data);
              throw new Error('[backend] searchBook axios error');
            }),
          ),
      );

      const { total, books } = data;

      //검색결과가 없는 경우 리턴
      if (total < 1) return { totalPage: 0, books: [] };

      const bookList = books.map((book: Book) => {
        const { title, subtitle, image } = book;
        return new BookDTO({ title: title, subtitle: subtitle, image: image });
      });

      return {
        totalPage: Math.ceil(total / 10),
        books: bookList,
      };
    }
  }

  checkParams(params: SearchBookParams): {
    valid: boolean;
    notKeywordList?: string[];
  } {
    const { search, page } = params;
    const searchRegExp = /[\{\}\[\]\/?.,;:\)*~`!^\_+<>@\#$%&\\\=\(\'\"]/g;
    const pageRegExp = /[0-9]/g;
    const searchInvalid = searchRegExp.test(search);
    const pageValid = pageRegExp.test(page);

    const notSplit = search.split('-');
    const orCount = search.split('|').length - 1;
    const notCount = notSplit.length - 1;
    const countValid = orCount + notCount < 2;

    const orIndex = search.indexOf('|');
    const notIndex = search.indexOf('-');
    const indexValid =
      orIndex !== 0 &&
      orIndex !== search.length - 1 &&
      notIndex !== 0 &&
      notIndex !== search.length - 1;

    const paramsValid = !searchInvalid && pageValid && countValid && indexValid;

    if (notCount === 1) {
      return { valid: paramsValid, notKeywordList: notSplit };
    } else {
      return { valid: paramsValid };
    }
  }

  async getNotKeywordBookList(params: {
    notKeywordList: string[];
    page: string;
  }): Promise<{ totalPage: number; books: BookDTO[] }> {
    const { notKeywordList, page } = params;
    const [includeKeyword, excludeKeyword] = notKeywordList;

    const bookList = [];

    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          `https://api.itbook.store/1.0/search/${includeKeyword}/${page}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw new Error('[backend] searchBook axios error');
          }),
        ),
    );

    const { total, books } = data;

    //검색결과가 없는 경우 리턴
    if (total < 1) return { totalPage: 0, books: [] };

    bookList.push(...books);

    //1페이지 이상(10개 이상) 데이터가 있는 경우 추가 검색 진행
    if (total > 10) {
      const promiseList = Array.from(
        {
          length: Math.ceil(total / 10) - 1,
        },
        (_, i) => {
          return 2 + i;
        },
      ).map((requestPage) => {
        return firstValueFrom(
          this.httpService
            .get<any>(
              `https://api.itbook.store/1.0/search/${includeKeyword}/${requestPage}`,
            )
            .pipe(
              catchError((error: AxiosError) => {
                console.error(error.response.data);
                throw new Error('[backend] searchBook axios error');
              }),
            ),
        );
      });

      const allResponse = await Promise.all(promiseList);
      allResponse.forEach(({ data: { books } }) => {
        bookList.push(...books);
      });
    }

    //exclude keyword 필터링 로직
    const filteredBookList = bookList.filter((book: Book) => {
      const { title, subtitle } = book;

      const lowerExcludeKeyword = excludeKeyword.toLowerCase();
      const titleValid = title.toLowerCase().indexOf(lowerExcludeKeyword) < 0;
      const subTitleValid =
        subtitle.toLowerCase().indexOf(lowerExcludeKeyword) < 0;

      return titleValid && subTitleValid;
    });

    //페이지네이션
    const startIndex = 10 * (Number(page) - 1);
    const endIndex = startIndex + 10;

    const paginatedBookList = filteredBookList
      .filter((_, index) => {
        const indexValid = index >= startIndex && index < endIndex;

        return indexValid;
      })
      .map((book: Book) => {
        const { title, subtitle, image } = book;
        return new BookDTO({ title: title, subtitle: subtitle, image: image });
      });

    if (!filteredBookList?.length) return { totalPage: 0, books: [] };

    return {
      totalPage: Math.ceil(filteredBookList?.length / 10),
      books: paginatedBookList,
    };
  }
}
