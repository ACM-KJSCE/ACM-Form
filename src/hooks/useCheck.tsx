import { FormData } from "../interfaces/form";

const allFilled = (data: FormData) => {
    console.log(data);
  return Object.values(data).every((value) => value.trim() !== "");
};

const regexProper = (
  url: string,
  name: "github" | "linkedin" | "codechef" | "resume" | "phone" | "description"
) => {
  const regex = {
    github: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
    codechef: /^(https?:\/\/)?(www\.)?codechef\.com\/users\/[a-zA-Z0-9_-]+\/?$/,
    resume: /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/view(?:\?[^ ]*)?)?$/,
    phone: /^\d{10}$/,
    description: /^(?:\b\w+\b[\s\r\n]*){30,}$/
  };
  return regex[name].test(url);
};

const hasAtLeast30Words = (paragraph: string) => {
  const words = paragraph.trim().split(/\s+/);
  return words.length >= 30;
}

const useCheck = () => {
  return { allFilled, regexProper,hasAtLeast30Words };
};

export default useCheck;
