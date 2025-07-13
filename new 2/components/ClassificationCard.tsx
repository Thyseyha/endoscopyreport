import React from 'react';

interface ClassificationCardProps {
  title: string;
  value: string;
  description: string;
  Icon: React.ElementType;
}

const ClassificationCard: React.FC<ClassificationCardProps> = ({ title, value, Icon, description }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-start space-x-4 transition hover:bg-slate-100 hover:shadow-sm">
      <div className="bg-white p-2 rounded-full border border-slate-200 flex-shrink-0">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <div className="flex-grow">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-lg font-semibold text-slate-800 break-words">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default ClassificationCard;