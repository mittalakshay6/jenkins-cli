import Parameter from "./parameter";
import * as inquirer from "inquirer";
import { List } from "lodash";

export default class ChoiceParameter extends Parameter {
  choices: List<string> | undefined;
  constructor(name: string, description: string, choices: List<string>) {
    super(name, description);
    this.choices = choices;
  }
  async getParamterValuesFromUser(): Promise<object> {
    let message: string;
    message = `${this.name}?`;
    if (this.description) {
      message += ` (${this.description})`;
    }
    let responses: any = await inquirer.prompt([
      {
        name: this.name,
        message: message,
        type: "list",
        choices: this.choices,
      },
    ]);
    this.value = responses[this.name];
    return Promise.resolve(this);
  }
}
