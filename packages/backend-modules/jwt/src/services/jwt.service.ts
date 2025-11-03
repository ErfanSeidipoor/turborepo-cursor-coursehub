import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as JwtServiceNestjs, JwtSignOptions } from '@nestjs/jwt';
import { EnvEnum } from '../env.enum';
import { IToken } from '../types';

@Injectable()
export class JwtService {
  constructor(
    private readonly configService: ConfigService,
    private jwtServiceNestjs: JwtServiceNestjs,
  ) {}

  public sign(payload: IToken, options?: JwtSignOptions) {
    return this.jwtServiceNestjs.sign(payload, {
      secret: this.configService.get<string>(EnvEnum.JWT__SECRET)!,
      ...options,
    });
  }

  public verify(token: string, options?: JwtSignOptions) {
    return this.jwtServiceNestjs.verify(token, {
      secret: this.configService.get(EnvEnum.JWT__SECRET),
      ...options,
    });
  }

  public decode(token: string) {
    return this.jwtServiceNestjs.decode(token);
  }
}
