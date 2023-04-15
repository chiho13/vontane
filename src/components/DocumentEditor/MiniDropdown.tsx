import { motion } from "framer-motion";
import { useTheme } from "styled-components";
import { forwardRef } from "react";
import Image from "next/image";
import { List, FileQuestion, CheckCircle } from "lucide-react";

interface MiniDropdownProps {
  isOpen: boolean;
  addMCQBlock: () => void;
  addEquationBlock: () => void;
  genBlock: (value: string) => void;
}

export const MiniDropdown = forwardRef<HTMLDivElement, MiniDropdownProps>(
  ({ isOpen, addMCQBlock, addEquationBlock, genBlock }, ref) => {
    const theme = useTheme();
    const addBlock = (event: React.KeyboardEvent) => {
      addEquationBlock();
    };

    const addQuizBlock = (event: React.KeyboardEvent) => {
      addMCQBlock();
    };

    const mathQ = (event: React.KeyboardEvent) => {
      genBlock("math");
    };

    const englishQ = (event: React.KeyboardEvent) => {
      genBlock("english");
    };

    return (
      <div
        ref={ref}
        className="dropdown-menu h-[360px] overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-md"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="mb-1 flex w-full items-center rounded-md border-2 border-gray-100 p-3 shadow-sm transition duration-300 hover:bg-gray-100"
          onClick={addQuizBlock}
        >
          <div className=" flex h-[60px] w-[60px] items-center justify-center rounded-md border">
            <CheckCircle color={theme.colors.darkergray} />
          </div>
          <span className="ml-4 ">Add Quiz Block</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="mb-1 flex w-full items-center rounded-md border-2 border-gray-100 p-3 shadow-sm transition duration-300 hover:bg-gray-100"
          onClick={englishQ}
        >
          <div className=" flex h-[60px] w-[60px] items-center justify-center rounded-md border">
            <List color={theme.colors.darkergray} />
            <FileQuestion color={theme.colors.darkergray} />
          </div>
          <span className="ml-4 ">English MCQ</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="mb-1 flex w-full items-center rounded-md border-2 border-gray-100 p-3 shadow-sm transition duration-300 hover:bg-gray-100"
          onClick={mathQ}
        >
          <Image
            src="/images/math.png"
            alt="add latex block equation"
            width={60}
            height={60}
            className="rounded-md border"
          />
          <span className="ml-4 ">Math Questions</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center rounded-md border-2 border-gray-100 p-3 shadow-sm transition duration-300 hover:bg-gray-100"
          onClick={addBlock}
        >
          <Image
            src="/images/tex.png"
            alt="add latex block equation"
            width={60}
            height={60}
            className="rounded-md border"
          />
          <span className="ml-4 ">Add Block Equation</span>
        </motion.button>
      </div>
    );
  }
);

MiniDropdown.displayName = "MiniDropdown";
