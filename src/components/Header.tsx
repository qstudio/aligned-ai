
import React from "react";
import { Dices } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="w-full flex justify-center items-center p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <Dices className="h-6 w-6 text-decision-purple" />
        <h1 className="text-2xl font-bold text-gray-800">Decision Helper</h1>
      </div>
    </header>
  );
};

export default Header;
