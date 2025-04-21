import React from "react";
import { GetServerSideProps } from "next";
import { getCookie } from "utils/session";

export default function ManageGroupOrder() {
  return <></>;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const branchId = Number(ctx.query.id);
  const groupId = Number(ctx.query.g);
  const ownerId = Number(ctx.query.o);
  const user = getCookie("user", ctx);

  if (user?.id == ownerId) {
    return {
      redirect: {
        destination: `/`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: `/group/order/${branchId}?g=${groupId}`,
      permanent: false,
    },
  };
};
