import React, { useState } from "react";
import { useQuery } from "react-query";
import useDebounce from "hooks/useDebounce";
import TextInput from "../inputs/textInput";
import profileService from "../../services/profile";
import { FormControlLabel, RadioGroup, Skeleton } from "@mui/material";
import RadioInput from "../inputs/radioInput";

import cls from "./sendWalletMoney.module.scss";

interface UserSelectProps {
  name: string;
  value: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
  error?: boolean;
}

export default function SelectUser({
  onChange,
  value,
  name,
  label,
  placeholder,
  error,
}: UserSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 400);

  const { data: users, isFetching } = useQuery(
    ["userList", debouncedSearchTerm],
    () => profileService.userList({ search: debouncedSearchTerm }),
    {
      enabled: debouncedSearchTerm.length > 0,
    },
  );

  return (
    <>
      <TextInput
        label={label}
        placeholder={placeholder}
        error={error}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isFetching && (
        <>
          <Skeleton animation="wave" width="100%" height="3rem" />
          <Skeleton animation="wave" width="100%" height="3rem" />
          <Skeleton animation="wave" width="100%" height="3rem" />
        </>
      )}
      <RadioGroup
        name={name}
        value={value}
        onChange={onChange}
        className={cls.radioGroup}
      >
        {users?.data.map((user) => (
          <FormControlLabel
            key={user.uuid}
            value={user.uuid}
            control={<RadioInput />}
            label={`${user.firstname} ${user.lastname}`}
          />
        ))}
      </RadioGroup>
    </>
  );
}
