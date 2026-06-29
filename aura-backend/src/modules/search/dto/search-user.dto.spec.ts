import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SearchUserDto } from './search-user.dto';

describe('SearchUserDto', () => {
  it('rejects an empty keyword', async () => {
    const dto = plainToInstance(SearchUserDto, { keyword: '   ' });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'keyword')).toBe(true);
  });

  it('accepts a non-empty keyword', async () => {
    const dto = plainToInstance(SearchUserDto, { keyword: 'admin' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
