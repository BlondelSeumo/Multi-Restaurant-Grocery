export const getUpdatedStocks = (formStocks, stocks, deletedIds) => {
  return stocks
    ?.map((stock) => {
      const formStock = formStocks?.find((formStock) =>
        stock?.extras?.every((stockExtra) =>
          formStock?.extras?.find(
            (formExtra) => formExtra?.value === stockExtra?.value,
          ),
        ),
      );

      return formStock || stock;
    })
    ?.filter((stock) => !deletedIds?.includes(stock?.stock_id));
};
