const EMAIL_REPLACE_REGEX = /.+?(.+?)(?:@|\+\d+).+?(.+?)\./;

export class StringUtils {
  static censorGuid(guid: string): string {
    const match = EMAIL_REPLACE_REGEX.exec(guid);
    let result = guid;
    if (match) {
      if (match[1]) {
        result = result.replace(match[1], '***');
      }
      if (match[2]) {
        result = result.replace(match[2], '***');
      }
    }
    return result;
  }

  static pad(str: string, paddingLength: number): string {
    if (str.length > paddingLength) {
      return str;
    }
    return (str + ' '.repeat(paddingLength - str.length));
  }

  static getTime(): string {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }
}
