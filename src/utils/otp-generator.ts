export async function createOtpDigit(length: number = 4): Promise<string> {
  const digits = '0123456789';
  let OTP = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    OTP += digits[randomIndex];
  }

  return OTP;
}
