import React from 'react';
import Input from '../Input';
import './tooltip.scss';

interface IProps {
  profit?: string;
  score: number;
}

const Tooltip = (props: IProps) => {
  return (
    <div className="tooltip">
      <div
        className={`tooltip-content ${
          props.score === 0 ? 'after:top-[64px]' : props.score === 0.1 ? 'after:top-[14px]' : 'after:top-[0px]'
        }`}
        style={{
          top: `${
            props.score === 0
              ? 260
              : props.score === 0.1
              ? 260
              : props.score === 2
              ? 211
              : props.score === 3
              ? 158
              : props.score === 4
              ? 105
              : props.score === 5
              ? 52
              : props.score === 50 && 0
          }px`
        }}
      >
        <div>
          <label>Profit</label>
          <Input type="text" readOnly={true} value={props.profit} icon="Hamburger" />
        </div>
        <div>
          <label>Chance</label>
          <Input
            type="text"
            readOnly={true}
            value={
              props.score === 0
                ? '14.99'
                : props.score === 0.1
                ? '49.98'
                : props.score === 2
                ? '18.74'
                : props.score === 3
                ? '12.49'
                : props.score === 4
                ? '2.50'
                : props.score === 5
                ? '1.25'
                : props.score === 50
                ? '0.04'
                : ''
            }
            icon="Hamburger"
          />
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
