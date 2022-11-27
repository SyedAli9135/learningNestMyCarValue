import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('ahmadnumair@gmail.com', 'asdf');
    expect(async () => {
      await service.signup('khalid@gmail.com', 'asdf');
    }).rejects.toThrow(BadRequestException);
  });

  it('throws if signin is called with an unused email', async () => {
    expect(async () => {
      await service.signin('asdflkj@asdlfkj.com', 'passdflkj');
    }).rejects.toThrow(NotFoundException);
  });

  // it('throws if an invalid password is provided', async () => {
  //   await service.signup('ahmad@gmail.com', 'password');
  //   const user = await service.signin('ahmad@gmail.com', 'password');
  //   expect(user).toBeDefined();
  // });

  // it('returns a user if correct password is provided', async () => {
  //   await service.signup('asdf@asdf.com', 'mypassword');
  //   const user = await service.signin('asdf@asdf.com', 'mypassword');
  //   expect(user).toBeDefined();
  // });
});
