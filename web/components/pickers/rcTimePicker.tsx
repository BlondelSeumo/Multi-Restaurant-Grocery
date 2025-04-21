import React from "react";
import cls from "./pickers.module.scss";
import usePopover from "hooks/usePopover";
import ArrowDownSLineIcon from "remixicon-react/ArrowDownSLineIcon";
import PopoverContainer from "containers/popover/popover";
import RadioInput from "components/inputs/radioInput";
import { SelectProps } from "@mui/material";

interface Props extends SelectProps {
  options?: {
    label: string;
    value: string;
  }[];
}

export default function RcTimePicker({
  label,
  error,
  value,
  name,
  onChange,
  options,
}: Props) {
  const [open, anchor, handleOpen, handleClose] = usePopover();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(event, undefined);
    handleClose();
  };

  const controlProps = (item: string) => ({
    checked: value === item,
    onChange: handleChange,
    value: item,
    id: item,
    name,
    inputProps: { "aria-label": item },
  });

  return (
    <div className={cls.container}>
      {!!label && <h4 className={cls.title}>{label}</h4>}
      <div
        className={`${cls.wrapper} ${error ? cls.error : ""}`}
        onClick={handleOpen}
      >
        <span className={cls.text}>
          {options?.find((el) => el.value === value)?.label}
        </span>
        <ArrowDownSLineIcon />
      </div>
      <PopoverContainer open={open} anchorEl={anchor} onClose={handleClose}>
        <div className={cls.body}>
          {options?.map((item) => (
            <div key={item.value} className={cls.row}>
              <RadioInput {...controlProps(item.value)} />
              <label className={cls.label} htmlFor={item.value}>
                <span className={cls.text}>{item.label}</span>
              </label>
            </div>
          ))}
        </div>
      </PopoverContainer>
    </div>
  );
}
