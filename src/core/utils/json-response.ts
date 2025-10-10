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

  public of(): any {
    const jsonResult = {};
    for (const [key, value] of this.entries()) {
      jsonResult[key as string] = value;
    }
    return jsonResult;
  }
}
