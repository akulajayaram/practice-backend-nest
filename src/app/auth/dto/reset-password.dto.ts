import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  resetToken: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(passwordRegEx, {
    message: `Password must contain:
      - Minimum 8 and maximum 20 characters
      - At least one uppercase letter
      - At least one lowercase letter
      - At least one number
      - At least one special character`,
  })
  newPassword: string;
}
