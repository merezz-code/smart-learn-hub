import { useState, useEffect } from "react";
import { toast } from "sonner";

export function AlgoTowerGame() {
  const questions = [
    {
      code: "for(let i=0;i<3;i++){console.log(i)}",
      correct: "0 1 2"
    },
    {
      code: "let x=5; x+=3; console.log(x)",
      correct: "8"
    },
    {
      code: "['a','b','c'].reverse().join('-')",
      correct: "c-b-a"
    }
  ];

  const [index, setIndex] = useState(0);

  const check = (val: string) => {
    if (val === questions[index].correct) {
      toast.success("Correct !");
      setIndex(i => (i + 1) % questions.length);
    } else {
      toast.error("Incorrect !");
    }
  };

  return (
    <div className="card-base p-6 max-w-xl mx-auto">
      <pre className="bg-muted p-4 rounded-xl mb-4 text-sm">
        {questions[index].code}
      </pre>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => check("0 1 2")} className="btn">0 1 2</button>
        <button onClick={() => check("c-b-a")} className="btn">c-b-a</button>
        <button onClick={() => check("8")} className="btn">8</button>
        <button onClick={() => check("undefined")} className="btn">undefined</button>
      </div>
    </div>
  );
}
