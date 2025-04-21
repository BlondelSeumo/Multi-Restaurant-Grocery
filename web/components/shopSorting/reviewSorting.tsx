import React from "react";
import RadioInput from "components/inputs/radioInput";
import cls from "./shopSorting.module.scss";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const sortingList = [
  {
    label: "newest_first",
    value: {
      column: "created_at",
      sort: "desc",
    },
  },
  {
    label: "oldest_first",
    value: {
      column: "created_at",
      sort: "asc",
    },
  },
  {
    label: "highest_rated",
    value: {
      column: "rating",
      sort: "desc",
    },
  },
  {
    label: "lowest_rated",
    value: {
      column: "rating",
      sort: "asc",
    },
  },
];

type Props = {
  handleClose: () => void;
};

export default function ReviewSorting({ handleClose }: Props) {
  const { t } = useTranslation();
  const { replace, query } = useRouter();
  const sortBy = String(query.sort_by) || "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const sorted = sortingList.find((item) => item.label === value);
    replace(
      {
        pathname: "",
        query: {
          sort_by: value,
          column: sorted?.value.column,
          sort: sorted?.value.sort,
        },
      },
      undefined,
      { shallow: true }
    );
    handleClose();
  };

  const controlProps = (item: string) => ({
    checked: sortBy === item,
    onChange: handleChange,
    value: item,
    id: item,
    name: "sorting",
    inputProps: { "aria-label": item },
  });

  return (
    <div className={cls.wrapper}>
      {sortingList.map((item) => (
        <div className={cls.row} key={item.label}>
          <RadioInput {...controlProps(item.label)} />
          <label className={cls.label} htmlFor={item.label}>
            <span className={cls.text}>{t(item.label)}</span>
          </label>
        </div>
      ))}
    </div>
  );
}
