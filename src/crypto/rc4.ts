export class RC4 {

  private state: number[];
  private key: Buffer;
  private i: number;
  private j: number;

    constructor(key: Buffer) {
    this.key = key;
    this.reset();
  }

    cipher(data: Buffer): void {
    for (let n = 0; n < data.length; n++) {
      this.i = (this.i + 1) % 256;
      this.j = (this.j + this.state[this.i]) % 256;
      const tmp = this.state[this.i];
      this.state[this.i] = this.state[this.j];
      this.state[this.j] = tmp;
      const k = this.state[(this.state[this.i] + this.state[this.j]) % 256];
      /* tslint:disable no-bitwise */
      data[n] = (data[n] ^ k);
      /* tslint:enable no-bitwise */
    }
  }

    private reset(): void {
    this.state = new Array(256);
    this.i = 0;
    this.j = 0;
    for (let i = 0; i < 256; i++) {
      this.state[i] = i;
    }

    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + this.state[i] + this.key[i % this.key.length]) % 256;
      const tmp = this.state[i];
      this.state[i] = this.state[j];
      this.state[j] = tmp;
    }
  }
}

export const OUTGOING_KEY = '6a39570cc9de4ec71d64821894';
export const INCOMING_KEY = 'c79332b197f92ba85ed281a023';
