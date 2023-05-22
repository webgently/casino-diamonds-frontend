import React from 'react';
import './diamond.scss';

const Diamond = ({ img, active, shadow }: any) => {
  return (
    <div className={`diamond-item ${img ? img : ''}`}>
      <div className="hidden bg-red bg-green bg-blue bg-cyan bg-pink bg-purple bg-yellow bg-thick-red bg-thick-green bg-thick-blue bg-thick-cyan bg-thick-pink bg-thick-purple bg-thick-yellow" />
      <div className="diamond-box">
        <div className={`${shadow && '_shadow'} ${active ? `bg-thick-${img}` : 'bg-[#223843]'}`} />
        <div className={active ? `bg-${img}` : 'bg-[#354452]'} />
      </div>
    </div>
  );
};

export default Diamond;
