import { FormData } from "../interfaces/form";

const allFilled = (data: FormData, hasMembership: boolean = false) => {
  console.log(data)
  const values = hasMembership
    ? Object.entries(data)
    : Object.entries(data).filter(([key]) => key !== 'membershipNumber');

  return values.every(([_, value]) => value.trim() !== "");
};

const regexProper = (
  url: string,
  name: "roll" | "github" | "linkedin" | "codechef" | "resume" | "phone" | "description" | "acmID" | "cg"
) => {
  const regex = {
    roll: /^\d{11}$/,
    github: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
    codechef: /^(https?:\/\/)?(www\.)?codechef\.com\/users\/[a-zA-Z0-9_-]+\/?$/,
    resume: /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/view(?:\?[^ ]*)?)?$/,
    phone: /^\d{10}$/,
    description: /^(?:\b\w+\b[\s\r\n]*){30,}$/,
    acmID: /^\d{7}$/,
    cg: /^(10(\.0{1,2})?|[0-9](\.\d{1,2})?)$/
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
