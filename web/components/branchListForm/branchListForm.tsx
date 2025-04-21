import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import RadioInput from "components/inputs/radioInput";
import cls from "./branchListForm.module.scss";
import DarkButton from "components/button/darkButton";
import { Skeleton } from "@mui/material";
import { IShop } from "interfaces";
import { useBranch } from "contexts/branch/branch.context";

interface Props {
  data?: IShop[];
  isLoading?: boolean;
  handleSubmit: (id: string) => void;
}

export default function BranchListForm({
  data = [],
  isLoading = false,
  handleSubmit,
}: Props) {
  const { t } = useTranslation();
  const { branch } = useBranch();
  const [selectedValue, setSelectedValue] = useState<string>(
    String(branch?.id),
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  const controlProps = (item: string) => ({
    checked: selectedValue === item,
    onChange: handleChange,
    value: item,
    id: item,
    name: "branch",
    inputProps: { "aria-label": item },
  });

  return (
    <>
      <div className={cls.wrapper}>
        <div className={cls.body}>
          {!isLoading
            ? data.map((item) => (
                <div key={item.id} className={cls.row}>
                  <RadioInput {...controlProps(String(item.id))} />
                  <label className={cls.label} htmlFor={String(item.id)}>
                    <span className={cls.text}>{item.translation?.title}</span>
                    <div className={cls.muted}>{item.translation?.address}</div>
                  </label>
                </div>
              ))
            : Array.from(new Array(2)).map((item, idx) => (
                <Skeleton
                  key={"branches" + idx}
                  variant="rectangular"
                  className={cls.shimmer}
                />
              ))}

          {!data.length && !isLoading && <div>{t("branches.not.found")}</div>}
        </div>
        <div className={cls.footer}>
          <div className={cls.action}>
            <DarkButton onClick={() => handleSubmit(selectedValue)}>
              {t("save")}
            </DarkButton>
          </div>
        </div>
      </div>
    </>
  );
}
