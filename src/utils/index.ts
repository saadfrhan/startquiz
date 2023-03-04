import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';

export const shuffler = (array: any[]) =>
  [...array].sort(() => Math.random() - 0.5);

const sleep = (ms: number = 2000) => new Promise(resolve => setTimeout(resolve, ms));

export async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow('Welcome to the Quiz CLI');
  await sleep();
  console.log(`
    ${chalk.bgBlue('Instructions:')}
    ${chalk.blue('1.')} Firstly, select question type.
    ${chalk.blue('2.')} Then choose difficulty.
    ${chalk.blue('3.')} Choose a category.
    ${chalk.blue('4.')} Enter questions amount.
    ${chalk.blue('5.')} Then, answer the questions.
  `)
  rainbowTitle.stop();
  await sleep(1000);
}

export function removeEntities(_question: string, _choices: string[]) {
  const question = _question.replace(/&[^;]+;/g, '');
  let choices: string[] = []
  if (_choices.length === 4) {
    const processedChoices = _choices.map(choice =>
      choice.replace(/&[^;]+;/g, '')
    );
    choices = processedChoices;
  } else {
    choices = _choices;
  }
  return {
    question,
    choices
  }
}

export const numberValidator = (val: string) => !isNaN(Number(val)) || "Please enter amount in number";