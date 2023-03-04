import axios from 'axios';

export const CONSTANTS = {
  difficulty: ["Mix", "Easy", "Medium", "Hard"],
  type: ["Mix", "Multiple Choice", "True / False"],
  baseAPI: "https://opentdb.com/",
  categories: async () => {
    const { data } = await axios.get(`${CONSTANTS.baseAPI}api_category.php`)
    return [
      "0. Any category",
      ...data.trivia_categories.map((c: { id: number, name: string }) =>
        `${c.id - 8}. ${c.name}`)
    ] as string[]
  }
}