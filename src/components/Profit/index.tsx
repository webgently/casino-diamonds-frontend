import React from 'react';
import IconMenu from '../../components/Icons';
import './profit.scss';

const Profit = ({ label, status }: any) => {
  return (
    <div className="profit-calc-item">
      <div className="grid grid-cols-5 gap-[10px]">
        {status.map((item: ProfitStatusObject, ind: number) => {
          return <IconMenu key={ind} icon={item.diamond} className={item.color} size={20} />;
        })}
      </div>
      <p>{label}</p>
    </div>
  );
};

export default Profit;
