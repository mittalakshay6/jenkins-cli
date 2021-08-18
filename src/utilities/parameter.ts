export default abstract class Parameter {
  name: string;
  description: string;
  value: any;
  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
  abstract getParamterValuesFromUser(): Promise<object>;
}
