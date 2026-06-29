export class InvalidCredentialsException extends Error {
  constructor(message = 'ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง') {
    super(message);
    this.name = 'InvalidCredentialsException';
  }
}

export class InvalidTokenException extends Error {
  constructor(message = 'โทเคนไม่มีสิทธิ์เข้าถึง หรือหมดอายุการใช้งานแล้ว') {
    super(message);
    this.name = 'InvalidTokenException';
  }
}
