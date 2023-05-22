import React from 'react';
import IconMenu from '../../components/Icons';
import './input.scss';

interface IProps {
  type: string;
  readOnly?: boolean;
  value?: any;
  onChange?: any;
  icon?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const Input = (props: IProps) => {
  return (
    <div className="input-box">
      <input
        type={props.type}
        readOnly={props.readOnly}
        value={props.value}
        min={props.min}
        max={props.max}
        onChange={(e: any) => props.onChange(e.target.value)}
        disabled={props.disabled}
      />
      {props.icon && <IconMenu icon={props.icon} size={24} className="text-white" />}
    </div>
  );
};

export default Input;
