#!/usr/bin/env node

import inquirer, { QuestionCollection } from 'inquirer';
import { CONSTANTS } from './constants/index.js';
import { createSpinner } from 'nanospinner';
import chalk from 'chalk';
import { welcome, removeEntities, numberValidator } from './utils/index.js';
import { ParametersObj } from './types/index.js';
import { fetchQuestions } from './api/index.js';

class Parameters {
  constructor(private readonly options: ParametersObj) {}

  public present() {
    const obj: { [key: string]: any } = {};

    obj.difficulty =
      this.options.difficulty !== 'Mix'
        ? this.options.difficulty.toLowerCase()
        : undefined;

    if (
      this.options.type !== 'Multiple Choice' &&
      this.options.type !== 'Mix'
    ) {
      obj.type = 'boolean';
    } else if (this.options.type !== 'Mix') {
      obj.type = 'multiple';
    }

    obj.category =
      this.options.category[0] === '0'
        ? undefined
        : Number(this.options.category.split(' ')[0][0]) + 8;

    obj.amount = this.options.amount;

    const result: { [key: string]: any } = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value) {
        result[key] = value;
      }
    }

    return result as ParametersObj;
  }
}

class Question {
  constructor(
    public message: string,
    public type: string,
    public choices?: string[] | (() => Promise<string[]>),
    public defaultVal?: string | boolean | number,
    private readonly validate?: (val: any) => boolean | string
  ) {}

  async prompt(): Promise<{ answer: any }> {
    const { answer } = await inquirer.prompt([
      {
        name: 'answer',
        message: this.message,
        choices: this.choices ?? undefined,
        type: this.type,
        default: this.defaultVal ?? undefined,
        validate: this.type === 'amount' ? this.validate : undefined,
      },
    ] as QuestionCollection<{ answer: any }>);
    return { answer };
  }
}

class Parameter {
  constructor(
    private readonly name: string,
    private readonly choices?: string[] | (() => Promise<string[]>),
    private readonly defaultVal?: string
  ) {}

  async prompt(): Promise<{ param: string }> {
    const { answer: param } = await new Question(
      this.name === 'amount'
        ? `Enter amount`
        : `Please select the ${this.name}:`,
      this.choices ? 'list' : 'input',
      this.choices ?? undefined,
      this.defaultVal ?? undefined,
      this.name === 'amount' ? numberValidator : undefined
    ).prompt();
    return { param };
  }
}

class ParameterSetter {
  type: string = '';
  difficulty: string = '';
  category: string = '';
  amount: string = '';

  async setParameters() {
    this.type = (await new Parameter('type', CONSTANTS.type).prompt()).param;

    this.difficulty = (
      await new Parameter('difficulty', CONSTANTS.difficulty).prompt()
    ).param;

    const spinner = createSpinner('Fetching categories...').start();

    const categories = await CONSTANTS.categories();

    if (categories.length > 0) {
      spinner.success({ text: 'Fetched!' });
      this.category = (
        await new Parameter('category', CONSTANTS.categories).prompt()
      ).param;
    } else {
      spinner.error({ text: 'Failed!' });
    }

    this.amount = (
      await new Parameter('amount', undefined, '10').prompt()
    ).param;

    return this;
  }
}

class main {
  score: number = 0;
  playerName: string;

  constructor(playerName?: string) {
    this.playerName = playerName!;
  }

  async start() {
    if (!this.playerName) {
      this.playerName = (
        await new Question(
          'What is your name?',
          'input',
          undefined,
          'Anonymous'
        ).prompt()
      ).answer;
    }

    const questions = await fetchQuestions(
      new Parameters(await new ParameterSetter().setParameters()).present()
    );

    const spinner = createSpinner('Fetching questions...').start();

    if (Array.isArray(questions)) {
      spinner.success({ text: 'Questions fetched!' });

      for (let i = 0; i < questions.length; i++) {
        const { question, choices } = removeEntities(
          questions[i].message,
          questions[i].choices.all
        );

        const { answer } = await new Question(
          question,
          'list',
          choices
        ).prompt();

        if (answer === questions[i].choices.correct) {
          this.score++;
          console.log(
            `✔️  Good job ${this.playerName}, Your score is now ${this.score}.`
          );
        } else if (this.score > 0) {
          this.score--;
          console.log(
            `❌ ${this.playerName}, your score decreased to ${this.score}`
          );
        } else {
          console.log(`❌ ${this.playerName}, your score is 0.`);
        }
      }

      console.log(
        chalk.blue(`The game ends, your final score is ${this.score}.`)
      );
    } else {
      spinner.error({ text: questions as string });
    }

    if (
      (
        await new Question(
          'Do you want to play again?',
          'confirm',
          undefined,
          false
        ).prompt()
      ).answer
    ) {
      await new main(this.playerName).start();
    } else {
      console.log(chalk.yellow('Bye! 👋'));
    }
  }
}

(async () => {
  await welcome();
  return await new main().start();
})();
