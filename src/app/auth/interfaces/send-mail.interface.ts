export interface SendRegistrationUrlDto {
  to: string;
  context: {
    name: string;
    activationUrl: string;
  };
}

export interface SendResetPasswordOtpDto {
  to: string;
  context: {
    name: string;
    otp: string;
  };
}
