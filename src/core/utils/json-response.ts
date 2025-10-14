export interface JsonResponseObject {
  code: number;
  message: string;
  [key: string]: unknown;
}

export class JsonResponse extends Map {
  constructor() {
    super();
    this.set('code', 0);
    this.set('message', 'SUCCESS');
  }

  public get(key: string): any {
    return super.get(key);
  }

  public set(key: string, value: any): this {
    return super.set(key, value);
  }

  public of(): JsonResponseObject {
    const jsonResult: JsonResponseObject = {
      code: this.get('code') as number,
      message: this.get('message') as string,
    };
    for (const [key, value] of this.entries()) {
      if (key !== 'code' && key !== 'message') {
        jsonResult[key as string] = value;
      }
    }
    return jsonResult;
  }
}
