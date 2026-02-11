import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ nullable: true })
  avatar: string | null;

  @ApiProperty()
  role: string;
}

export class TokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class LoginResponseDto extends TokensDto {
  @ApiProperty({ type: UserInfoDto })
  user: UserInfoDto;
}

export class RefreshTokenDto {
  @ApiProperty()
  refreshToken: string;
}
