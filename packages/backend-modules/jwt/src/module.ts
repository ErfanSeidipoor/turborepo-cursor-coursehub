import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule as JwtModuleNestjs } from '@nestjs/jwt';
import { services } from './services';
import { JWTStrategy } from './strategies';
import { EnvEnum } from './env.enum';

for (const key of Object.keys(EnvEnum)) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} must be defined`);
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    JwtModuleNestjs.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(EnvEnum.JWT__SECRET),
        signOptions: {
          expiresIn: configService.get<string>(EnvEnum.JWT__EXPIRES_IN),
        },
      }),
    }),
  ],
  exports: [...services],
  providers: [JWTStrategy, ...services],
  controllers: [],
})
export class JwtModule {}
