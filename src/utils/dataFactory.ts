import { faker } from '@faker-js/faker';

export function makeEmail(prefix = 'pw.user'): string {
  const safe = faker.internet.username().replace(/[^a-z0-9]/gi, '').toLowerCase();
  return `${prefix}.${Date.now()}.${safe}@example.com`;
}

export function makeUsPhoneE164(): string {
  const areaCode = faker.number.int({ min: 200, max: 999 }).toString();
  const prefix = faker.number.int({ min: 200, max: 999 }).toString();
  const lineNumber = faker.number.int({ min: 1000, max: 9999 }).toString();

  return `+1${areaCode}${prefix}${lineNumber}`;
}

export function makeUsPhoneNational(): string {
  const first = faker.helpers.arrayElement(['2', '3', '4', '5', '6', '7', '8', '9']);
  return `${first}${faker.string.numeric(9)}`;
}

export function makePassword(): string {
  return faker.internet.password({
    length: 12,
    memorable: false,
    pattern: /[A-Za-z0-9]/,
  });
}

export function makeCustomer() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const password = makePassword();

  return {
    firstName,
    lastName,
    email: makeEmail('pw.signup'),
    phone: makeUsPhoneNational(),
    password,
    confirmPassword: password,
  };
}
