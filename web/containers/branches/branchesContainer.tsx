import React from "react";
import cls from "./branchesContainer.module.scss";
import { IShop } from "interfaces";
import BranchHeader from "components/branchHeader/branchHeader";
import BranchMapSplash from "components/branchMap/branchMapSplash";
import { Skeleton } from "@mui/material";
import useLocale from "hooks/useLocale";
import { useBranch } from "contexts/branch/branch.context";
import StoreHorizontalCard from "components/storeHorizontalCard/storeHorizontalCard";

type Props = {
  data?: IShop[];
  loading: boolean;
};

export default function BranchesContainer({ data = [], loading }: Props) {
  const { t } = useLocale();
  const { updateBranch } = useBranch();

  return (
    <div>
      <BranchHeader />
      <div className="container">
        <div className={cls.wrapper}>
          <aside className={cls.aside}>
            <div className={cls.list}>
              {!loading
                ? data.map((item) => (
                    <StoreHorizontalCard
                      key={item.id}
                      data={item}
                      handleClick={() => updateBranch(item)}
                    />
                  ))
                : Array.from(new Array(3)).map((_, idx) => (
                    <Skeleton
                      key={"shimmer" + idx}
                      variant="rectangular"
                      className={cls.shimmer}
                    />
                  ))}
              {!data.length && !loading && <div>{t("branches.not.found")}</div>}
            </div>
          </aside>
          <main className={cls.main}>
            <div className={cls.splash}>
              <BranchMapSplash
                key={"branchMapSlash" + data.length}
                data={data}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
