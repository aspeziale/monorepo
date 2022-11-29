import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService } from '@aspeziale/logger';
import { MemcachedService } from '@andreafspeziale/nestjs-memcached';
import type { Cached } from '../../config';
import type { Cat } from './cats.interfaces';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [{ id: 1, name: 'Bubi', age: 7 }];

  constructor(
    private readonly logger: LoggerService,
    private readonly memcachedService: MemcachedService,
  ) {
    this.logger.setContext(CatsService.name);
  }

  async getCat(id: number): Promise<Cat> {
    this.logger.log('Fetching cat...', {
      fn: this.getCat.name,
      id,
    });

    const cachedCat = await this.memcachedService.get<Cached<Cat>>(id.toString());

    if (!cachedCat) {
      const filteredCats = this.cats.filter((c) => id === c.id);

      if (filteredCats.length !== 1 || !filteredCats[0]) {
        throw new NotFoundException();
      }

      await this.memcachedService.setWithMeta<Cat>(filteredCats[0].id.toString(), filteredCats[0]);

      return filteredCats[0];
    }

    return cachedCat.content;
  }
}
