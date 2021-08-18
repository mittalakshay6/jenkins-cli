import Parameter from "./parameter";
import * as inquirer from "inquirer";

export default class StringParameter extends Parameter {
  defaultValue: string;
  constructor(name: string, description: string, defaultValue: string) {
    super(name, description);
    this.defaultValue = defaultValue;
  }
  async getParamterValuesFromUser(): Promise<object> {
    let message: string;
    message = this.name;
    if (this.defaultValue) {
      message += ` Default: ${this.defaultValue}) ?`;
    } else {
      message += "?";
    }
    if (this.description) {
      message += ` (${this.description})`;
    }
    let responses: any = await inquirer.prompt([
      {
        name: this.name,
        message: message,
        type: "input",
        default: this.defaultValue.length ? this.defaultValue : undefined,
      },
    ]);
    this.value = responses[this.name];
    return Promise.resolve(this);
  }
}
