import { FormData } from "../interfaces/form";


// const allFilled = (data: FormData, hasMembership: boolean = false) => {
//   console.log(data)
//   const values = hasMembership
//     ? Object.entries(data)
//     : Object.entries(data).filter(([key]) => key !== 'membershipNumber');

//   return values.every(([_, value]) => value.trim() !== "");
// };

const validateField = (name: string, value: string, setValidationErrors:Function) => {
  
    let isValid = true;
    
    if (value.trim() === "") {
      isValid = false;
    } else {
      switch (name) {
        case "rollNumber":
          isValid = regexProper(value, "roll");
          break;
        case "phoneNumber":
          isValid = regexProper(value, "phone");
          break;
        case "githubProfile":
          isValid = regexProper(value, "github");
          break;
        case "linkedinProfile":
          isValid = regexProper(value, "linkedin");
          break;
        case "codechefProfile":
          isValid = regexProper(value, "codechef");
          break;
        case "resume":
          isValid = regexProper(value, "resume");
          break;
        case "whyACM":
          isValid = hasAtLeast30Words(value);
          break;
        case "cgpa":
          isValid = regexProper(value, "cg");
          break;
      }
    }
    
    setValidationErrors((prev: Record<string, boolean>) => ({
      ...prev,
      [name]: !isValid
    }));
    
    return isValid;
  };


  const validateForm = (formData: FormData, setTouched:React.Dispatch<React.SetStateAction<Record<string, boolean>>>, setValidationErrors:React.Dispatch<React.SetStateAction<Record<string, boolean>>>) => {
      const errors: Record<string, boolean> = {};
      let isValid = true;
      
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      
      const requiredFields = [
        "rollNumber", "branch", "year", "phoneNumber", 
        "githubProfile", "linkedinProfile", "codechefProfile", 
        "resume", "whyACM", "cgpa", "role", "role2"
      ];
      
      for (const field of requiredFields) {
        let fieldIsValid = true;
        
        if (!formData[field as keyof FormData]) {
          fieldIsValid = false;
        } else {
          switch (field) {
            case "rollNumber":
              fieldIsValid = regexProper(formData.rollNumber, "roll");
              break;
            case "phoneNumber":
              fieldIsValid = regexProper(formData.phoneNumber, "phone");
              break;
            case "githubProfile":
              fieldIsValid = regexProper(formData.githubProfile, "github");
              break;
            case "linkedinProfile":
              fieldIsValid = regexProper(formData.linkedinProfile, "linkedin");
              break;
            case "codechefProfile":
              fieldIsValid = regexProper(formData.codechefProfile, "codechef");
              break;
            case "resume":
              fieldIsValid = regexProper(formData.resume, "resume");
              break;
            case "whyACM":
              fieldIsValid = hasAtLeast30Words(formData.whyACM);
              break;
            case "cgpa":
              fieldIsValid = regexProper(formData.cgpa, "cg");
              break;
          }
        }
        
        errors[field] = !fieldIsValid;
        
        if (!fieldIsValid) {
          isValid = false;
        }
      }
    
      if (formData.role && formData.role === formData.role2) {
        errors.role = true;
        errors.role2 = true;
        isValid = false;
      }
      
      setValidationErrors(errors);
      return isValid;
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

 const getInputClasses = (fieldName: string, touched: Record<string, boolean>, validationErrors:Record<string, boolean>, formData: FormData) => {
    const isViewOnly = localStorage.getItem("ViewForm") === "true";
    const isInvalid = touched[fieldName] && validationErrors[fieldName];
    const isEmpty = touched[fieldName] && !formData[fieldName as keyof FormData];
    
    let baseClasses = "p-2 mt-1 block w-full rounded-lg shadow-sm transition-colors ";
    
    if (isViewOnly) {
      return baseClasses + "bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed";
    } else if (isInvalid) {
      return baseClasses + "bg-gray-800/50 border-2 border-red-500 text-white focus:ring-red-400";
    } else if (isEmpty) {
      return baseClasses + "bg-gray-800/50 border-2 border-yellow-500 text-white focus:border-blue-500 focus:ring-blue-500";
    } else {
      return baseClasses + "bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500";
    }
  };

const useCheck = () => {
  return { validateField, validateForm,getInputClasses };
};

export default useCheck;
