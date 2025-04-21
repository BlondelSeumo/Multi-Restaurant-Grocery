import React, { useMemo } from "react";
import cls from "./recipeNavbar.module.scss";
import usePopover from "hooks/usePopover";
import { Category } from "interfaces";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import ArrowDownSLineIcon from "remixicon-react/ArrowDownSLineIcon";
import useLocale from "hooks/useLocale";

const CategoryDropdown = dynamic(
  () => import("components/categoryDropdown/categoryDropdown")
);

type Props = {
  categories: Category[];
};

export default function RecipeNavbar({ categories }: Props) {
  const { t } = useLocale();
  const { query, replace } = useRouter();
  const categoryId = Number(query.category_id);
  const [
    openDropdown,
    anchorDropdown,
    handleOpenDropdown,
    handleCloseDropdown,
  ] = usePopover();

  const { list, rest } = useMemo(() => {
    if (categories.length > 4) {
      return {
        list: categories.slice(0, 4),
        rest: categories.slice(4),
      };
    }
    return {
      list: categories,
      rest: [],
    };
  }, [categories]);

  function filterByCategory(event: any, id: any = null) {
    event.preventDefault();
    replace(
      {
        pathname: "",
        query: {
          category_id: id,
        },
      },
      undefined,
      { shallow: true }
    );
  }

  return (
    <ul className={cls.navbar}>
      <li className={cls.navItem}>
        <Link
          href="/recipes"
          shallow={true}
          replace={true}
          className={`${cls.navLink} ${categoryId ? "" : cls.active}`}
        >
          {t("all")}
        </Link>
      </li>
      {list.map((item) => (
        <li key={item.id} className={cls.navItem}>
          <Link
            href={`/recipes?category_id=${item.id}`}
            shallow={true}
            replace={true}
            className={`${cls.navLink} ${
              item.id === categoryId ? cls.active : ""
            }`}
          >
            {item.translation.title}
          </Link>
        </li>
      ))}
      {rest.length > 0 && (
        <li className={cls.navItem}>
          <button className={cls.moreBtn} onClick={handleOpenDropdown}>
            <span className={cls.text}>{t("more")}</span>
            <ArrowDownSLineIcon />
          </button>
        </li>
      )}
      <CategoryDropdown
        data={rest}
        type="recipe"
        handleClickItem={filterByCategory}
        open={openDropdown}
        anchorEl={anchorDropdown}
        onClose={handleCloseDropdown}
      />
    </ul>
  );
}
